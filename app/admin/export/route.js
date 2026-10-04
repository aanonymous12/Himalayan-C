import { getAdmin } from '@/lib/auth';
import { parseRange, fetchOrders } from '@/lib/range';
import { when } from '@/lib/format';

const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// Orders in a date range as a spreadsheet file. Only administrators can download it.
export async function GET(request) {
  const admin = await getAdmin();
  if (!admin) return new Response('Not found', { status: 404 });
  const r = parseRange(Object.fromEntries(new URL(request.url).searchParams));
  const orders = await fetchOrders(admin.sb, r.from, r.to, '*, order_items(name, qty, option_label, spice, addons)');
  const head = ['Order', 'Date', 'Status', 'Customer', 'Phone', 'Email', 'Pickup', 'Items', 'Subtotal', 'Promo', 'Discount', 'Tax', 'Total', 'Notes'];
  const rows = orders.map((o) => [
    o.order_number, when(o.created_at), o.status, o.customer_name, o.phone, o.email, o.pickup_time,
    (o.order_items || []).map((i) => `${i.qty} x ${i.name}${i.option_label ? ` (${i.option_label})` : ''}${i.spice ? ` ${i.spice}` : ''}${(i.addons || []).length ? ` +${i.addons.map((a) => a.label).join('/')}` : ''}`).join('; '),
    o.subtotal, o.promo_code, o.discount, o.tax, o.total, o.notes,
  ]);
  const csv = [head, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
  return new Response('\ufeff' + csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="orders-${r.from}-to-${r.to}.csv"` } });
}
