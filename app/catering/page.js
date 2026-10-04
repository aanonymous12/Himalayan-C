import PageHero from '@/components/PageHero';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import { submitCatering } from '@/app/actions';
import { getSettings } from '@/lib/settings';
import { todayISO, telHref } from '@/lib/format';

export const metadata = {
  title: 'Catering',
  description: 'Nepali and Indian catering in San Marcos, TX for parties, offices and events. Request a quote online.',
  alternates: { canonical: '/catering' },
};

export default async function Catering() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Catering" sub="Bring the flavors of the Himalayas to your event." />
      <section className="section">
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div>
            <div className="sec-head"><h2>Tell us about your event</h2></div>
            <p className="lead">Parties, office lunches, weddings and gatherings. Share the date, headcount and anything you have in mind, and we will call you with a menu and a quote.</p>
            <p className="muted">Prefer to talk? Call <a href={telHref(s.phone)}>{s.phone}</a>. Please allow a few days notice for larger orders.</p>
          </div>
          {s.catering_enabled ? (
            <ActionForm action={submitCatering} className="form-card" resetOnSuccess>
              <div className="form-grid">
                <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" name="name" required autoComplete="name" /></div>
                <div className="field"><label htmlFor="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" required autoComplete="tel" /></div>
                <div className="field full"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" autoComplete="email" /></div>
                <div className="field"><label htmlFor="c-date">Event date</label><input id="c-date" name="event_date" type="date" required min={todayISO()} /></div>
                <div className="field"><label htmlFor="c-guests">Number of guests</label><input id="c-guests" name="guests" type="number" min="5" max="1000" defaultValue="25" required /></div>
                <div className="field full"><label htmlFor="c-msg">Details (type of event, dishes, dietary needs)</label><textarea id="c-msg" name="message" rows={5} required maxLength={2000} /></div>
              </div>
              <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <SubmitButton className="btn rust" pendingText="Sending...">Request a quote</SubmitButton>
            </ActionForm>
          ) : <div className="form-card"><h3>Catering requests are paused</h3><p className="muted">Please call <a href={telHref(s.phone)}>{s.phone}</a>.</p></div>}
        </div>
      </section>
    </>
  );
}
