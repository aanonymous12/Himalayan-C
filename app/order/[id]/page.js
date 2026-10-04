import { notFound } from 'next/navigation';
import Link from 'next/link';
import ClearCart from '@/components/ClearCart';
import LineDetails from '@/components/LineDetails';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import { money, STATUS_LABEL } from '@/lib/format';

export const metadata = { title: 'Order confirmed', robots: { index: false } };

// Guests have no account, so the unguessable order id in the URL is their access key.
export default async function Confirmation({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = createAdminClient();
  const { data: o } = await db.from('orders').select('*, order_items(name, option_label, spice, addons, note, qty, unit_price)').eq('id', id).maybeSingle();
  if (!o) notFound();
  const s = await getSettings();

  return (
    <div className="wrap section" style={{ maxWidth: 680 }}>
      <ClearCart />
      <h1>Thank you, {o.customer_name.split(' ')[0]}. We have your order.</h1>
      <p style={{ margin: '1rem 0' }}>Order <b>#{o.order_number}</b> &nbsp;<span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span></p>
      <p>Pickup: <b>{o.pickup_time}</b> at {s.address.replace('\n', ', ')}. Pay when you collect.</p>
      <ul className="lines" style={{ marginTop: '1.5rem' }}>
        {o.order_items.map((i, k) => (
          <li key={k}><div>{i.qty} x {i.name}<LineDetails line={i} /></div><span>{money(i.qty * i.unit_price)}</span></li>
        ))}
      </ul>
      <div className="totals">
        <div><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
        {Number(o.discount) > 0 && <div style={{ color: 'var(--green)' }}><span>Promo {o.promo_code}</span><span>&minus;{money(o.discount)}</span></div>}
        <div><span>Tax</span><span>{money(o.tax)}</span></div>
        <div className="grand"><span>Total due at pickup</span><span>{money(o.total)}</span></div>
      </div>
      <p style={{ marginTop: '1.5rem' }}>Need to change something? Call us at {s.phone} and mention order #{o.order_number}.</p>
      <Link href="/menu" className="btn line">Back to the menu</Link>
    </div>
  );
}
