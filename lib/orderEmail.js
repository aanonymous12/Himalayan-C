import 'server-only';
import { emailLayout, esc } from '@/lib/email';
import { money } from '@/lib/format';

const addr = (s) => String(s.address || '').replace(/\n/g, ', ');
const lineDetail = (r) => [r.option_label, r.spice && `${r.spice} spice`, (r.addons || []).map((a) => `+${a.label}`).join(', '), r.note && `Note: ${r.note}`].filter(Boolean).join(' | ');

const td = 'padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:14px;vertical-align:top;';
function itemsTable(rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;">${rows.map((r) => `<tr><td style="${td}">${r.qty} &times; ${esc(r.name)}${lineDetail(r) ? `<br><span style="font-size:12px;color:#7a675b;">${esc(lineDetail(r))}</span>` : ''}</td><td align="right" style="${td}white-space:nowrap;">${money(r.qty * r.unit_price)}</td></tr>`).join('')}</table>`;
}
function totals(o) {
  const row = (a, b, bold) => `<tr><td style="padding:3px 0;font-size:${bold ? 16 : 14}px;${bold ? 'font-weight:bold;' : ''}">${a}</td><td align="right" style="padding:3px 0;font-size:${bold ? 16 : 14}px;${bold ? 'font-weight:bold;' : ''}">${b}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">${row('Subtotal', money(o.subtotal))}${Number(o.discount) > 0 ? row(`Promo ${esc(o.promo_code)}`, `&minus;${money(o.discount)}`) : ''}${row('Tax', money(o.tax))}${row('Total due at pickup', money(o.total), true)}</table>`;
}
const foot = (s) => `${esc(s.business_name)}<br>${esc(addr(s))}<br>${esc(s.phone)}<br>You are getting this email because an order was placed with this email address on our website.`;

// Sent to the customer right after the order is saved.
export function customerOrderEmail({ order, rows, settings: s, trackUrl }) {
  const body = `<p style="font-size:15px;line-height:1.6;margin:0 0 14px;">Hi ${esc(order.customer_name.split(' ')[0])}, thank you. We have your order and we are getting it ready. This is the only email we will send about it.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5f0;border-radius:10px;margin:0 0 14px;"><tr><td style="padding:12px 14px;font-size:14px;line-height:1.7;"><b>Order #${order.order_number}</b><br>Pickup: <b>${esc(order.pickup_time)}</b><br>Where: ${esc(addr(s))}</td></tr></table>
${itemsTable(rows)}${totals(order)}
${trackUrl ? `<p style="margin:18px 0 6px;"><a href="${esc(trackUrl)}" style="background:#9a4f26;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:15px;font-weight:bold;display:inline-block;">Track your order</a></p><p style="font-size:12px;color:#7a675b;margin:0 0 4px;">The page updates by itself as we prepare your food, so we will not email you again. ${esc(trackUrl)}</p>` : ''}
<p style="font-size:14px;line-height:1.6;margin:16px 0 0;"><b>Pay at the restaurant</b> when you collect. Need to change something? Call us on ${esc(s.phone)} and mention order #${order.order_number}.</p>`;
  return { subject: `Your order #${order.order_number} is confirmed`, html: emailLayout({ name: s.business_name, heading: 'Your order is confirmed', preheader: `Order #${order.order_number}, pickup ${order.pickup_time}`, body, footer: foot(s) }) };
}

// Sent to the restaurant so the kitchen sees it straight away.
export function adminOrderEmail({ order, rows, settings: s, site }) {
  const body = `<p style="font-size:15px;line-height:1.6;margin:0 0 12px;"><b>${esc(order.customer_name)}</b><br>${esc(order.phone)}${order.email ? `<br>${esc(order.email)}` : ''}<br>Pickup: <b>${esc(order.pickup_time)}</b></p>
${itemsTable(rows)}${totals(order)}${order.notes ? `<p style="font-size:14px;margin:14px 0 0;"><b>Customer note:</b> ${esc(order.notes)}</p>` : ''}
${site ? `<p style="margin:18px 0 0;"><a href="${esc(site)}/admin/orders" style="background:#9a4f26;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:bold;display:inline-block;">Open orders</a></p>` : ''}`;
  return { subject: `New online order #${order.order_number} (${money(order.total)})`, html: emailLayout({ name: s.business_name, heading: `New order #${order.order_number}`, preheader: `${order.customer_name}, ${money(order.total)}, pickup ${order.pickup_time}`, body, footer: 'Sent automatically by your website.' }) };
}
