import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ReservationForm from '@/components/ReservationForm';
import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { timeSlots, todayISO, telHref, TZ } from '@/lib/format';

export const metadata = {
  title: 'Reservations',
  description: 'Reserve a table or book a private event at Himalayan Nepalese & Indian Cuisine in San Marcos, TX.',
  alternates: { canonical: '/reservations' },
};

export default async function Reservations() {
  const [s, { user, profile }] = await Promise.all([getSettings(), getSession()]);
  const maxDate = new Date(Date.now() + 180 * 864e5).toLocaleDateString('en-CA', { timeZone: TZ });
  return (
    <>
      <PageHero title="Reservations" sub="Book a table for dinner or reserve space for an event." />
      <section className="section">
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div>
            <div className="sec-head"><h2>Reserve your visit</h2></div>
            <p className="lead">Choose a date and time and we will confirm by phone or email.</p>
            <ul className="pillars-list" style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0' }}>
              <li style={{ padding: '.9rem 0', borderBottom: '1px solid var(--line)' }}><b>Hours</b><br /><span className="pre muted">{s.hours}</span></li>
              <li style={{ padding: '.9rem 0', borderBottom: '1px solid var(--line)' }}><b>Tables</b><br /><span className="muted">1 to 12 guests. Larger groups, please choose Event.</span></li>
              <li style={{ padding: '.9rem 0', borderBottom: '1px solid var(--line)' }}><b>Same-day or urgent?</b><br /><span className="muted">Call <a href={telHref(s.phone)}>{s.phone}</a>.</span></li>
            </ul>
            <p className="muted">Just want to order food? <Link href="/menu">Order online for pickup.</Link></p>
          </div>
          {s.reservations_enabled
            ? <ReservationForm slots={timeSlots(s.open_time, s.close_time)} minDate={todayISO()} maxDate={maxDate} defaults={{ name: profile?.full_name, phone: profile?.phone, email: user?.email }} />
            : <div className="form-card"><h3>Online reservations are paused</h3><p className="muted">Please call <a href={telHref(s.phone)}>{s.phone}</a> and we will book you in.</p></div>}
        </div>
      </section>
    </>
  );
}
