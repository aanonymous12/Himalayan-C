import Link from 'next/link';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import { getSettings } from '@/lib/settings';
import { telHref } from '@/lib/format';

export const metadata = {
  title: 'Order online',
  description: 'Order Nepali and Indian food online for pickup in San Marcos, TX. Catering and reservations available. Pay at the restaurant.',
  alternates: { canonical: '/order' },
};

export default async function OrderHub() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Order online" sub="Pick the way that suits you. Payment is always taken at the restaurant." />
      <section className="section">
        <div className="wrap">
          <div className="cards c4">
            <div className="card option"><span className="icon-badge"><Icon name="bag" /></span><h3>Pickup</h3><p>Build your order, choose a pickup time, and collect it hot.</p>
              {s.accepting_orders ? <Link href="/menu" className="btn rust sm">Start your order</Link> : <p className="soldout">Paused right now. Call {s.phone}.</p>}</div>
            {s.catering_enabled && <div className="card option"><span className="icon-badge"><Icon name="truck" /></span><h3>Catering</h3><p>Trays and platters for groups of 5 or more.</p><Link href="/catering" className="btn rust sm">Request a quote</Link></div>}
            <div className="card option"><span className="icon-badge"><Icon name="door" /></span><h3>Walk in</h3><p>Come by and order at the counter. No wait for a table at quiet times.</p><Link href="/contact" className="btn rust sm">Hours and directions</Link></div>
            {s.doordash_url && <div className="card option"><span className="icon-badge"><Icon name="truck" /></span><h3>Delivery</h3><p>Get it delivered through DoorDash.</p><a href={s.doordash_url} target="_blank" rel="noopener noreferrer" className="btn rust sm">Order on DoorDash</a></div>}
          </div>
        </div>
      </section>
      <section className="section soft">
        <div className="wrap">
          <div className="sec-head"><h2>How pickup works</h2></div>
          <div className="cards c3">
            <div className="card"><h3>1. Choose your dishes</h3><p className="muted" style={{ margin: '.5rem 0 0' }}>Browse the menu and add what you like.</p></div>
            <div className="card"><h3>2. Check out</h3><p className="muted" style={{ margin: '.5rem 0 0' }}>As a guest, or log in to save your details and see past orders.</p></div>
            <div className="card"><h3>3. Pay at the restaurant</h3><p className="muted" style={{ margin: '.5rem 0 0' }}>No online payment. Questions? Call <a href={telHref(s.phone)}>{s.phone}</a>.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
