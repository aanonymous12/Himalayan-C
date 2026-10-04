import Link from 'next/link';
import AutoRefresh from '@/components/AutoRefresh';
import { requireAdmin } from '@/lib/auth';
import { money, dayKey, when, STATUS_LABEL } from '@/lib/format';

export default async function Dashboard() {
  const { sb } = await requireAdmin();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data: ordersData } = await sb.from('orders').select('*, order_items(name, qty, unit_price)').gte('created_at', since).order('created_at', { ascending: false });
  const orders = ordersData ?? [];
  const count = async (table, col, val) => (await sb.from(table).select('id', { count: 'exact', head: true }).eq(col, val)).count ?? 0;
  const [pendingRes, newMsgs, openFeedback] = await Promise.all([count('reservations', 'status', 'pending'), count('messages', 'handled', false), count('feedback', 'resolved', false)]);

  const valid = orders.filter((o) => o.status !== 'cancelled');
  const sum = (list) => list.reduce((n, o) => n + Number(o.total), 0);
  const today = dayKey(new Date());
  const todays = valid.filter((o) => dayKey(o.created_at) === today);
  const open = orders.filter((o) => ['new', 'preparing', 'ready'].includes(o.status));

  const days = Array.from({ length: 7 }, (_, i) => dayKey(new Date(Date.now() - (6 - i) * 864e5)));
  const perDay = days.map((d) => ({ d, total: sum(valid.filter((o) => dayKey(o.created_at) === d)) }));
  const max = Math.max(...perDay.map((x) => x.total), 1);

  const tally = {};
  valid.forEach((o) => o.order_items.forEach((i) => {
    tally[i.name] = tally[i.name] || { qty: 0, sales: 0 };
    tally[i.name].qty += i.qty; tally[i.name].sales += i.qty * Number(i.unit_price);
  }));
  const top = Object.entries(tally).sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);

  return (
    <>
      <AutoRefresh />
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>
      <div className="stats">
        <div className="stat"><b>{open.length}</b>Open orders</div>
        <div className="stat"><b>{money(sum(todays))}</b>Sales today ({todays.length} orders)</div>
        <div className="stat"><b>{money(sum(valid.filter((o) => days.includes(dayKey(o.created_at)))))}</b>Last 7 days</div>
        <div className="stat"><b>{money(sum(valid))}</b>Last 30 days ({valid.length} orders)</div>
      </div>

      <div className="stats">
        <Link href="/admin/reservations" className="stat"><b>{pendingRes}</b>Reservations to confirm</Link>
        <Link href="/admin/messages" className="stat"><b>{newMsgs}</b>Unhandled messages</Link>
        <Link href="/admin/messages" className="stat"><b>{openFeedback}</b>Open feedback</Link>
      </div>

      <div className="two" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Sales by day</h2>
          <div className="bars" style={{ marginTop: '1rem' }}>
            {perDay.map((x) => (
              <div className="bar" key={x.d}><span>{x.d.slice(5)}</span><i style={{ width: `${(x.total / max) * 100}%`, minWidth: x.total ? 4 : 0 }} /><span>{money(x.total)}</span></div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Best sellers, 30 days</h2>
          <table style={{ marginTop: '.75rem' }}>
            <thead><tr><th>Dish</th><th>Sold</th><th>Sales</th></tr></thead>
            <tbody>{top.map(([n, v]) => <tr key={n}><td>{n}</td><td>{v.qty}</td><td>{money(v.sales)}</td></tr>)}
              {!top.length && <tr><td colSpan={3} className="muted">Nothing yet. Orders will show up here.</td></tr>}</tbody>
          </table>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Latest orders</h2><Link href="/admin/orders">All orders</Link>
      </div>
      <table style={{ marginTop: '.75rem' }}>
        <thead><tr><th>#</th><th>When</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {orders.slice(0, 8).map((o) => (
            <tr key={o.id}><td>{o.order_number}</td><td>{when(o.created_at)}</td><td>{o.customer_name}{o.user_id ? '' : ' (guest)'}</td><td><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span></td><td>{money(o.total)}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
