import { redirect } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PasswordForm from '@/components/PasswordForm';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { money, when, dateLong, timeLabel, STATUS_LABEL, RES_LABEL } from '@/lib/format';

export const metadata = { title: 'My account', robots: { index: false } };

export default async function Account() {
  const { user, profile, isAdmin } = await getSession();
  if (!user) redirect('/login?next=/account');
  const sb = await createClient();
  const [{ data: orders }, { data: reservations }] = await Promise.all([
    sb.from('orders').select('*, order_items(name, option_label, qty)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    sb.from('reservations').select('*').eq('user_id', user.id).order('res_date', { ascending: false }).limit(20),
  ]);

  return (
    <>
      <PageHero title={`Hi${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}`} sub={user.email} />
      <section className="section">
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div>
            {isAdmin && <div className="ok" style={{ marginBottom: '1.5rem' }}>You are signed in as an administrator. <Link href="/admin"><b>Open the dashboard</b></Link></div>}
            <div className="sec-head"><h2>Your orders</h2></div>
            {!orders?.length && <p>No orders yet. <Link href="/menu">Start with the menu.</Link></p>}
            {orders?.map((o) => (
              <div className="order" key={o.id}>
                <div className="order-top"><b>Order #{o.order_number}</b><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span></div>
                <div className="muted">{when(o.created_at)} &nbsp; Pickup: {o.pickup_time}</div>
                <ul>{o.order_items.map((i, k) => <li key={k}>{i.qty} x {i.name}{i.option_label ? ` (${i.option_label})` : ''}</li>)}</ul>
                <b>{money(o.total)}</b>
              </div>
            ))}
            <div className="sec-head" style={{ marginTop: '2.5rem' }}><h2>Your reservations</h2></div>
            {!reservations?.length && <p>No reservations yet. <Link href="/reservations">Book a table.</Link></p>}
            {reservations?.map((r) => (
              <div className="order" key={r.id}>
                <div className="order-top"><b>#{r.ref} &nbsp;{dateLong(r.res_date)} at {timeLabel(String(r.res_time).slice(0, 5))}</b><span className="status">{RES_LABEL[r.status]}</span></div>
                <div className="muted">{r.party_size} {r.party_size === 1 ? 'guest' : 'guests'}</div>
              </div>
            ))}
          </div>
          <div className="form-card"><PasswordForm /></div>
        </div>
      </section>
    </>
  );
}
