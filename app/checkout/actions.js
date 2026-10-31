'use server';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { run } from '@/lib/action';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdmin } from '@/lib/auth';
import { sendEmail, isEmail, emailEnabled } from '@/lib/email';
import { customerOrderEmail, adminOrderEmail } from '@/lib/orderEmail';
import { digits } from '@/lib/format';
import { siteUrl } from '@/lib/site';
import { priceLines, round2 } from '@/lib/cart';
import { evaluatePromo } from '@/lib/promo';

const NIL = '00000000-0000-0000-0000-000000000000';

async function loadMenu(db, lines) {
  const ids = [...new Set((Array.isArray(lines) ? lines : []).map((l) => l?.itemId).filter(Boolean))];
  const { data } = await db.from('menu_items').select('id,name,price,options,available,spice_levels,addons').in('id', ids.length ? ids : [NIL]);
  return Object.fromEntries((data || []).map((m) => [m.id, m]));
}

// Preview of a promo code at checkout. The order is re-checked again when it is placed.
export async function checkPromo(payload) {
  return run(payload, undefined, async (p) => {
    const db = createAdminClient();
    const priced = priceLines(await loadMenu(db, p?.items), p?.items);
    if (priced.error) return { error: priced.error };
    const r = await evaluatePromo(db, p?.code, priced.subtotal, p?.phone);
    if (r.none) return { error: 'Please enter a promo code.' };
    if (r.error) return { error: r.error };
    return { ok: true, code: r.code, discount: r.discount, label: r.label };
  });
}

// Prices always come from the database. The browser only says what and how many.
export async function placeOrder(payload) {
  return run(payload, undefined, async (p) => {
    if (await getAdmin()) return { error: 'You cannot place an order as admin.' };

    const name = String(p?.name || '').trim().slice(0, 80);
    const phone = String(p?.phone || '').trim().slice(0, 30);
    const email = String(p?.email || '').trim().slice(0, 120) || null;
    const notes = String(p?.notes || '').trim().slice(0, 500) || null;
    const pickup = String(p?.pickup || '').trim().slice(0, 40) || 'ASAP';
    if (!name) return { error: 'Please enter your name.' };
    if (digits(phone).length < 10) return { error: 'Please enter a phone number we can reach, including area code.' };
    if (email && !isEmail(email)) return { error: 'That email address does not look right.' };

    const db = createAdminClient();
    const { data: settings } = await db.from('settings').select('accepting_orders, tax_rate, email, business_name, address, phone').eq('id', 1).single();
    if (!settings?.accepting_orders) return { error: 'We are not taking online orders right now. Please call us.' };

    const priced = priceLines(await loadMenu(db, p?.items), p?.items);
    if (priced.error) return { error: priced.error };

    let discount = 0, promo = null, promoRow = null;
    if (String(p?.code || '').trim()) {
      const r = await evaluatePromo(db, p.code, priced.subtotal, phone);
      if (r.error) return { error: r.error };
      discount = r.discount; promo = r.code; promoRow = r.promo;
    }
    const taxable = round2(priced.subtotal - discount);
    const tax = round2(taxable * Number(settings.tax_rate));
    const total = round2(taxable + tax);

    const { data: order, error } = await db.from('orders')
      .insert({ customer_name: name, phone, email, notes, pickup_time: pickup, subtotal: priced.subtotal, discount, tax, total, promo_code: promo })
      .select('id, order_number').single();
    if (error) return { error: 'Something went wrong saving your order. Please try again or call us.' };

    const { error: e2 } = await db.from('order_items').insert(priced.rows.map((r) => ({ ...r, order_id: order.id })));
    if (e2) {
      await db.from('orders').delete().eq('id', order.id);
      return { error: 'Something went wrong saving your order. Please try again or call us.' };
    }

    if (promoRow) {
      // Two people could redeem the last use at the same moment, so count again now that this order exists.
      const { data: used } = await db.from('orders').select('phone').eq('promo_code', promo).neq('status', 'cancelled');
      const all = used ?? [];
      const over = (promoRow.max_uses != null && all.length > promoRow.max_uses)
        || (promoRow.per_phone != null && all.filter((o) => digits(o.phone) === digits(phone)).length > promoRow.per_phone);
      if (over) {
        await db.from('orders').delete().eq('id', order.id);
        return { error: 'Sorry, that promo code was just fully redeemed.' };
      }
    }

    // Emails are sent by the server after the customer has their confirmation page, so a slow or failing
    // mail service can never delay or break an order. The browser never touches the email service.
    const full = { ...order, customer_name: name, phone, email, notes, pickup_time: pickup, subtotal: priced.subtotal, discount, tax, total, promo_code: promo };
    after(async () => {
      try {
        if (!emailEnabled()) return;
        const site = siteUrl();
        // Two emails per order: the restaurant gets the details, the customer gets the confirmation and tracking link.
        const restaurantTo = settings.email || process.env.GMAIL_USER;
        const a = adminOrderEmail({ order: full, rows: priced.rows, settings, site });
        await sendEmail({ to: restaurantTo, subject: a.subject, html: a.html, replyTo: email });
        if (email) {
          const c = customerOrderEmail({ order: full, rows: priced.rows, settings, trackUrl: site ? `${site}/order/${order.id}` : '' });
          await sendEmail({ to: email, subject: c.subject, html: c.html, replyTo: settings.email });
        }
      } catch (e) { console.error('[order email]', e?.message); }
    });
    redirect(`/order/${order.id}`);
  });
}
