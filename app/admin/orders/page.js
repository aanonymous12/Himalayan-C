import Link from 'next/link';
import AutoRefresh from '@/components/AutoRefresh';
import LineDetails from '@/components/LineDetails';
import RangePicker from '@/components/admin/RangePicker';
import { requireAdmin } from '@/lib/auth';
import { parseRange, fetchOrders } from '@/lib/range';
import { setStatus } from '../actions';
import { money, when, telHref, digits, STATUSES, STATUS_LABEL } from '@/lib/format';

const NEXT = { new: 'preparing', preparing: 'ready', ready: 'completed' };

export default async function Orders({ searchParams }) {
  const { sb } = await requireAdmin();
  const sp = await searchParams;
  // With no dates chosen, show the last 30 days so the page is never empty after a quiet week.
  const r = parseRange(sp.from || sp.range ? sp : { range: '30d' });
  const status = STATUSES.includes(sp.status) ? sp.status : '';
  const q = String(sp.q || '').trim().toLowerCase();

  let list = await fetchOrders(sb, r.from, r.to, '*, order_items(name, option_label, spice, addons, note, qty, unit_price)');
  if (status) list = list.filter((o) => o.status === status);
  if (q) list = list.filter((o) => o.customer_name.toLowerCase().includes(q) || String(o.order_number) === q.replace('#', '') || (digits(q) && digits(o.phone).includes(digits(q))));
  const total = list.filter((o) => o.status !== 'cancelled').reduce((n, o) => n + Number(o.total), 0);
  const base = `from=${r.from}&to=${r.to}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  return (
    <>
      <AutoRefresh seconds={20} />
      <div className="page-head">
        <div><h1>Orders</h1><p className="muted">{list.length} {list.length === 1 ? 'order' : 'orders'} &middot; {money(total)} in sales (cancelled not counted)</p></div>
        <a className="btn sm line" href={`/admin/export?from=${r.from}&to=${r.to}`}>Download CSV</a>
      </div>
      <RangePicker r={r} path="/admin/orders" extra={{ status, q }} />
      <form className="searchbar" action="/admin/orders" method="get">
        <input type="hidden" name="from" value={r.from} /><input type="hidden" name="to" value={r.to} />{status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Search name, phone or order number" aria-label="Search orders" /><button className="btn sm">Search</button>
      </form>
      <div className="row" style={{ margin: '1rem 0 1.25rem' }}>
        <Link className="chip" aria-pressed={!status} href={`/admin/orders?${base}`}>All</Link>
        {STATUSES.map((s) => <Link key={s} className="chip" aria-pressed={status === s} href={`/admin/orders?${base}&status=${s}`}>{STATUS_LABEL[s]}</Link>)}
      </div>

      {!list.length && <p className="muted">No orders match.</p>}
      {list.slice(0, 200).map((o) => (
        <div className="order" key={o.id}>
          <div className="order-top">
            <b>#{o.order_number} &nbsp;{o.customer_name}</b>
            <span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span>
          </div>
          <div className="muted">{when(o.created_at)} &nbsp; Pickup: <b style={{ color: 'var(--fg)' }}>{o.pickup_time}</b> &nbsp; <a href={telHref(o.phone)}>{o.phone}</a>{o.email && <> &nbsp; {o.email}</>}</div>
          <ul className="order-lines">{o.order_items.map((i, k) => (
            <li key={k}><div>{i.qty} x <b>{i.name}</b><LineDetails line={i} /></div><span>{money(i.qty * i.unit_price)}</span></li>
          ))}</ul>
          {o.notes && <p className="note">Note: {o.notes}</p>}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span>
              {money(o.subtotal)}{Number(o.discount) > 0 && <> &minus; <b>{o.promo_code}</b> {money(o.discount)}</>} + tax {money(o.tax)} = <b>{money(o.total)}</b> <span className="muted">(pay at pickup)</span>
            </span>
            <div className="row">
              {NEXT[o.status] && (
                <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value={NEXT[o.status]} />
                  <button className="btn sm">Mark {STATUS_LABEL[NEXT[o.status]].toLowerCase()}</button></form>
              )}
              {o.status !== 'cancelled' && o.status !== 'completed' && (
                <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="cancelled" /><button className="btn sm line">Cancel</button></form>
              )}
            </div>
          </div>
        </div>
      ))}
      {list.length > 200 && <p className="muted">Showing the 200 most recent. Narrow the dates or download the CSV for everything.</p>}
    </>
  );
}
