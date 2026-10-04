import { dayKey, hourOf } from './format';

// Sales numbers for a list of orders. Cancelled orders are counted separately and never add to sales.
export function summarize(orders, days) {
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const sum = (k) => valid.reduce((n, o) => n + Number(o[k] || 0), 0);
  const perDay = Object.fromEntries(days.map((d) => [d, { day: d, total: 0, orders: 0 }]));
  const items = {}, promos = {}, status = {};
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 }));

  for (const o of valid) {
    const d = perDay[dayKey(o.created_at)];
    if (d) { d.total += Number(o.total); d.orders += 1; }
    hours[hourOf(o.created_at)].orders += 1;
    for (const i of o.order_items || []) {
      const e = (items[i.name] ??= { name: i.name, qty: 0, sales: 0 });
      e.qty += i.qty; e.sales += i.qty * Number(i.unit_price);
    }
    if (o.promo_code) {
      const e = (promos[o.promo_code] ??= { code: o.promo_code, uses: 0, discount: 0 });
      e.uses += 1; e.discount += Number(o.discount || 0);
    }
  }
  for (const o of orders) status[o.status] = (status[o.status] || 0) + 1;

  const revenue = sum('total');
  return {
    revenue, count: valid.length, avg: valid.length ? revenue / valid.length : 0,
    subtotal: sum('subtotal'), discount: sum('discount'), tax: sum('tax'), cancelled: orders.length - valid.length,
    byDay: days.map((d) => perDay[d]),
    top: Object.values(items).sort((a, b) => b.qty - a.qty || b.sales - a.sales).slice(0, 10),
    hours, status, promos: Object.values(promos).sort((a, b) => b.uses - a.uses),
  };
}

export const change = (now, before) => (before ? ((now - before) / before) * 100 : null);
