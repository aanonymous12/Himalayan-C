import Link from 'next/link';
import AutoRefresh from '@/components/AutoRefresh';
import { requireAdmin } from '@/lib/auth';
import { setStatus } from '../actions';
import { money, when, telHref, STATUSES, STATUS_LABEL } from '@/lib/format';

const NEXT = { new: 'preparing', preparing: 'ready', ready: 'completed' };

export default async function Orders({ searchParams }) {
  const { sb } = await requireAdmin();
  const { status } = await searchParams;
  let q = sb.from('orders').select('*, order_items(name, option_label, qty, unit_price)').order('created_at', { ascending: false }).limit(100);
  if (STATUSES.includes(status)) q = q.eq('status', status);
  const { data } = await q;
  const orders = data ?? [];

  return (
    <>
      <AutoRefresh seconds={20} />
      <h1 style={{ marginBottom: '1rem' }}>Orders</h1>
      <div className="row" style={{ marginBottom: '1.25rem' }}>
        <Link className={`btn sm ${status ? 'line' : ''}`} href="/admin/orders">All</Link>
        {STATUSES.map((s) => <Link key={s} className={`btn sm ${status === s ? '' : 'line'}`} href={`/admin/orders?status=${s}`}>{STATUS_LABEL[s]}</Link>)}
      </div>
      {!orders.length && <p className="muted">No orders here yet.</p>}
      {orders.map((o) => (
        <div className="order" key={o.id}>
          <div className="order-top">
            <b>#{o.order_number} &nbsp;{o.customer_name} {!o.user_id && <span className="muted">(guest)</span>}</b>
            <span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span>
          </div>
          <div className="muted">{when(o.created_at)} &nbsp; Pickup: <b style={{ color: 'inherit' }}>{o.pickup_time}</b> &nbsp; <a href={telHref(o.phone)}>{o.phone}</a>{o.email && <> &nbsp; {o.email}</>}</div>
          <ul>{o.order_items.map((i, k) => <li key={k}>{i.qty} x {i.name}{i.option_label ? ` (${i.option_label})` : ''} <span className="muted">{money(i.qty * i.unit_price)}</span></li>)}</ul>
          {o.notes && <p style={{ background: '#fff6d8', padding: '.4rem .7rem', borderRadius: 4 }}>Note: {o.notes}</p>}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span>Subtotal {money(o.subtotal)} + tax {money(o.tax)} = <b>{money(o.total)}</b> (pay at pickup)</span>
            <div className="row">
              {NEXT[o.status] && (
                <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value={NEXT[o.status]} />
                  <button className="btn sm">Mark {STATUS_LABEL[NEXT[o.status]].toLowerCase()}</button></form>
              )}
              {o.status !== 'cancelled' && o.status !== 'completed' && (
                <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="cancelled" />
                  <button className="btn sm line">Cancel</button></form>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
