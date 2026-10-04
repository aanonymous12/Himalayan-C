'use server';
import { redirect } from 'next/navigation';
import { run } from '@/lib/action';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, esc } from '@/lib/email';
import { money } from '@/lib/format';

const round2 = (n) => Math.round(n * 100) / 100;

// Prices are always re-read from the database. The browser only says what and how many.
export async function placeOrder(payload) {
  return run(payload, undefined, async (p) => {
    const name = String(p?.name || '').trim().slice(0, 80);
    const phone = String(p?.phone || '').trim().slice(0, 30);
    const email = String(p?.email || '').trim().slice(0, 120) || null;
    const notes = String(p?.notes || '').trim().slice(0, 500) || null;
    const pickup = String(p?.pickup || '').trim().slice(0, 40) || 'ASAP';
    const lines = Array.isArray(p?.items) ? p.items.slice(0, 60) : [];

    if (!name) return { error: 'Please enter your name.' };
    if (phone.replace(/\D/g, '').length < 10) return { error: 'Please enter a phone number we can reach, including area code.' };
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return { error: 'That email address does not look right.' };
    if (!lines.length) return { error: 'Your cart is empty.' };

    const db = createAdminClient();
    const { data: settings } = await db.from('settings').select('accepting_orders, tax_rate, email, business_name, address').eq('id', 1).single();
    if (!settings?.accepting_orders) return { error: 'We are not taking online orders right now. Please call us.' };

    const ids = [...new Set(lines.map((l) => l.itemId))];
    const { data: menu } = await db.from('menu_items').select('id, name, price, options, available').in('id', ids);
    const byId = Object.fromEntries((menu || []).map((m) => [m.id, m]));

    const rows = [];
    for (const l of lines) {
      const m = byId[l.itemId];
      const qty = Math.floor(Number(l.qty));
      if (!m || !m.available) return { error: `${l.name || 'An item'} is no longer available. Please remove it and try again.` };
      if (!(qty > 0 && qty <= 50)) return { error: 'Quantities must be between 1 and 50.' };
      let price = m.price, label = null;
      if (m.options?.length) {
        const o = m.options.find((x) => x.label === l.option);
        if (!o) return { error: `Please re-add ${m.name}. Its options changed.` };
        price = o.price; label = o.label;
      }
      rows.push({ menu_item_id: m.id, name: m.name, option_label: label, unit_price: price, qty });
    }

    const subtotal = round2(rows.reduce((n, r) => n + r.unit_price * r.qty, 0));
    const tax = round2(subtotal * Number(settings.tax_rate));
    const total = round2(subtotal + tax);
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();

    const { data: order, error } = await db.from('orders')
      .insert({ user_id: user?.id ?? null, customer_name: name, phone, email, notes, pickup_time: pickup, subtotal, tax, total })
      .select('id, order_number').single();
    if (error) return { error: 'Something went wrong saving your order. Please try again or call us.' };

    const { error: e2 } = await db.from('order_items').insert(rows.map((r) => ({ ...r, order_id: order.id })));
    if (e2) {
      await db.from('orders').delete().eq('id', order.id);
      return { error: 'Something went wrong saving your order. Please try again or call us.' };
    }

    const list = rows.map((r) => `<li>${r.qty} x ${esc(r.name)}${r.option_label ? ` (${esc(r.option_label)})` : ''} - ${money(r.qty * r.unit_price)}</li>`).join('');
    const body = `<ul>${list}</ul><p>Total due at pickup: <b>${money(total)}</b></p><p>Pickup: ${esc(pickup)}</p>`;
    await Promise.all([
      sendEmail({ to: settings.email, subject: `New online order #${order.order_number}`, html: `<p><b>${esc(name)}</b> ${esc(phone)}</p>${body}${notes ? `<p>Note: ${esc(notes)}</p>` : ''}` }),
      sendEmail({ to: email, subject: `Your order #${order.order_number} is confirmed`, html: `<p>Thanks, ${esc(name)}! We are preparing your order.</p>${body}<p>Pay at the restaurant when you pick up.<br>${esc(String(settings.address).replace(/\n/g, ', '))}</p>` }),
    ]);
    redirect(`/order/${order.id}`);
  });
}
