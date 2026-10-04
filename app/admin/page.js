import Link from 'next/link';
import AdminLogin from '@/components/AdminLogin';
import AutoRefresh from '@/components/AutoRefresh';
import RangePicker from '@/components/admin/RangePicker';
import SalesChart from '@/components/admin/SalesChart';
import { getAdmin } from '@/lib/auth';
import { parseRange, fetchOrders } from '@/lib/range';
import { summarize, change } from '@/lib/stats';
import { money, when, STATUS_LABEL } from '@/lib/format';

const hourLabel = (h) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;
const dateLabel = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function Delta({ now, before }) {
  const c = change(now, before);
  if (c === null) return <span className="delta flat">no earlier data</span>;
  return <span className={`delta ${c >= 0 ? 'up' : 'down'}`}>{c >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(c).toFixed(0)}% vs previous</span>;
}

export default async function Dashboard({ searchParams }) {
  const admin = await getAdmin();
  if (!admin) return <AdminLogin />;
  const { sb } = admin;
  const r = parseRange(await searchParams);

  const count = async (table, col, val, op = 'eq') => (await sb.from(table).select('id', { count: 'exact', head: true })[op](col, val)).count ?? 0;
  const [cur, prev, openOrders, pendingRes, newMsgs, openFeedback] = await Promise.all([
    fetchOrders(sb, r.from, r.to, '*, order_items(name, qty, unit_price)'),
    fetchOrders(sb, r.prevFrom, r.prevTo, 'id, created_at, status, total'),
    count('orders', 'status', ['new', 'preparing', 'ready'], 'in'),
    count('reservations', 'status', 'pending'),
    count('messages', 'handled', false),
    count('feedback', 'resolved', false),
  ]);
  const S = summarize(cur, r.days), P = summarize(prev, []);
  const maxQty = Math.max(...S.top.map((t) => t.qty), 1);
  const peak = Math.max(...S.hours.map((h) => h.orders), 1);
  const used = S.hours.filter((h) => h.orders > 0).map((h) => h.hour);
  const h0 = used.length ? Math.min(...used, 11) : 11, h1 = used.length ? Math.max(...used, 21) : 21;
  const period = r.from === r.to ? dateLabel(r.from) : `${dateLabel(r.from)} \u2013 ${dateLabel(r.to)}`;

  return (
    <>
      <AutoRefresh seconds={60} />
      <div className="page-head">
        <div><h1>Dashboard</h1><p className="muted">{period} &middot; {r.days.length} {r.days.length === 1 ? 'day' : 'days'}</p></div>
        <a className="btn sm line" href={`/admin/export?from=${r.from}&to=${r.to}`}>Download orders (CSV)</a>
      </div>
      <RangePicker r={r} />

      <div className="todo">
        <Link href="/admin/orders" className="todo-item"><b>{openOrders}</b><span>Open orders</span></Link>
        <Link href="/admin/reservations" className="todo-item"><b>{pendingRes}</b><span>Reservations to confirm</span></Link>
        <Link href="/admin/messages" className="todo-item"><b>{newMsgs}</b><span>Unhandled messages</span></Link>
        <Link href="/admin/messages" className="todo-item"><b>{openFeedback}</b><span>Open feedback</span></Link>
      </div>

      <div className="stats">
        <div className="stat"><span>Total sales</span><b>{money(S.revenue)}</b><Delta now={S.revenue} before={P.revenue} /></div>
        <div className="stat"><span>Orders</span><b>{S.count}</b><Delta now={S.count} before={P.count} /></div>
        <div className="stat"><span>Average order</span><b>{money(S.avg)}</b><span className="delta flat">{S.cancelled} cancelled</span></div>
        <div className="stat"><span>Discounts given</span><b>{money(S.discount)}</b><span className="delta flat">Tax collected {money(S.tax)}</span></div>
      </div>

      <div className="panel">
        <h2>Sales by day</h2>
        {S.count === 0 ? <p className="muted">No orders in this period.</p> : <SalesChart data={S.byDay} />}
      </div>

      <div className="two">
        <div className="panel">
          <h2>Best-selling items</h2>
          {S.top.length === 0 ? <p className="muted">Nothing sold in this period.</p> : (
            <table>
              <thead><tr><th>Dish</th><th>Sold</th><th>Sales</th></tr></thead>
              <tbody>{S.top.map((t) => (
                <tr key={t.name}><td>{t.name}<div className="meter"><i style={{ width: `${(t.qty / maxQty) * 100}%` }} /></div></td><td>{t.qty}</td><td>{money(t.sales)}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div className="panel">
          <h2>Busiest hours</h2>
          {S.count === 0 ? <p className="muted">No orders in this period.</p> : (
            <div className="bars">
              {S.hours.slice(h0, h1 + 1).map((h) => (
                <div className="bar" key={h.hour}><span>{hourLabel(h.hour)}</span><i style={{ width: `${(h.orders / peak) * 100}%`, minWidth: h.orders ? 4 : 0 }} /><span>{h.orders}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {S.promos.length > 0 && (
        <div className="panel">
          <h2>Promo codes used</h2>
          <table><thead><tr><th>Code</th><th>Orders</th><th>Discount given</th></tr></thead>
            <tbody>{S.promos.map((p) => <tr key={p.code}><td><b>{p.code}</b></td><td>{p.uses}</td><td>{money(p.discount)}</td></tr>)}</tbody></table>
        </div>
      )}

      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Latest orders</h2>
          <Link href={`/admin/orders?from=${r.from}&to=${r.to}`} className="btn sm line">All orders in this period</Link>
        </div>
        {cur.length === 0 ? <p className="muted">No orders in this period.</p> : (
          <table>
            <thead><tr><th>#</th><th>When</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>{cur.slice(0, 8).map((o) => (
              <tr key={o.id}><td>{o.order_number}</td><td>{when(o.created_at)}</td><td>{o.customer_name}</td><td><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span></td><td>{money(o.total)}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
