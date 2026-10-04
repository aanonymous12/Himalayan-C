import { todayISO, addDays, dayKey } from './format';

export const PRESETS = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['month', 'This month'], ['90d', 'Last 90 days']];
const valid = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !Number.isNaN(Date.parse(s));

// Turns ?range=7d or ?from=2026-10-01&to=2026-10-31 into a list of days (restaurant time) plus the period just before it.
export function parseRange(sp = {}) {
  const today = todayISO();
  let preset = sp.range, from, to;
  if (valid(sp.from) && valid(sp.to)) { from = sp.from; to = sp.to; preset = 'custom'; }
  else {
    preset = PRESETS.some(([k]) => k === preset) ? preset : '7d';
    to = preset === 'yesterday' ? addDays(today, -1) : today;
    from = { today, yesterday: addDays(today, -1), '7d': addDays(today, -6), '30d': addDays(today, -29), '90d': addDays(today, -89), month: `${today.slice(0, 8)}01` }[preset];
  }
  if (from > to) [from, to] = [to, from];
  if (to > addDays(from, 365)) from = addDays(to, -365);
  const days = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return { preset, from, to, days, prevFrom: addDays(from, -days.length), prevTo: addDays(from, -1) };
}

// Orders are stored in UTC. Fetch a slightly wider window, then keep the ones whose local date is in range.
// Supabase returns at most 1000 rows per request, so this pages through them.
export async function fetchOrders(sb, from, to, select = '*') {
  const a = `${addDays(from, -1)}T00:00:00Z`, b = `${addDays(to, 2)}T00:00:00Z`;
  const out = [];
  for (let page = 0; page < 20; page++) {
    const { data, error } = await sb.from('orders').select(select).gte('created_at', a).lt('created_at', b)
      .order('created_at', { ascending: false }).range(page * 1000, page * 1000 + 999);
    if (error) throw new Error(error.message);
    out.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return out.filter((o) => { const k = dayKey(o.created_at); return k >= from && k <= to; });
}
