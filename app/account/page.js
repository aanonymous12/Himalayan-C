import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { money, when, STATUS_LABEL } from '@/lib/format';

export const metadata = { title: 'My orders', robots: { index: false } };

export default async function Account() {
  const { user, profile } = await getSession();
  if (!user) redirect('/login?next=/account');
  const sb = await createClient();
  const { data: orders } = await sb.from('orders').select('*, order_items(name, option_label, qty)').order('created_at', { ascending: false });

  return (
    <div className="wrap section" style={{ maxWidth: 760 }}>
      <h1>Hi{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>
      <p className="muted">{user.email}</p>
      <h2 style={{ margin: '2rem 0 1rem' }}>Your orders</h2>
      {!orders?.length && <p>No orders yet. <Link href="/menu">Start with the menu.</Link></p>}
      {orders?.map((o) => (
        <div className="order" key={o.id}>
          <div className="order-top"><b>Order #{o.order_number}</b><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span></div>
          <div className="muted">{when(o.created_at)} &nbsp; Pickup: {o.pickup_time}</div>
          <ul>{o.order_items.map((i, k) => <li key={k}>{i.qty} x {i.name}{i.option_label ? ` (${i.option_label})` : ''}</li>)}</ul>
          <b>{money(o.total)}</b>
        </div>
      ))}
    </div>
  );
}
