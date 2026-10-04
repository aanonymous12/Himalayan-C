import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import InfoList, { MapEmbed, directionsUrl } from '@/components/InfoList';
import { submitContact } from '@/app/actions';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'Contact and location',
  description: 'Himalayan Nepalese & Indian Cuisine, 115 Wonder World Drive, San Marcos, TX 78666. Hours, phone, map and contact form.',
  alternates: { canonical: '/contact' },
};

export default async function Contact() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Contact and location" sub="We would love to hear from you." />
      <section className="section">
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div>
            <InfoList s={s} />
            <div className="social" style={{ margin: '1.5rem 0' }}>
              {s.instagram_url && <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" size={20} /></a>}
              {s.facebook_url && <a href={s.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="facebook" size={20} /></a>}
            </div>
            <a className="btn rust" href={directionsUrl(s)} target="_blank" rel="noopener noreferrer">Get directions</a>
          </div>
          <ActionForm action={submitContact} className="form-card" resetOnSuccess>
            <h2 style={{ fontSize: '1.7rem', marginBottom: '1rem' }}>Send us a message</h2>
            <div className="form-grid">
              <div className="field"><label htmlFor="m-name">Name</label><input id="m-name" name="name" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="m-phone">Phone (optional)</label><input id="m-phone" name="phone" type="tel" autoComplete="tel" /></div>
              <div className="field full"><label htmlFor="m-email">Email</label><input id="m-email" name="email" type="email" required autoComplete="email" /></div>
              <div className="field full"><label htmlFor="m-msg">Message</label><textarea id="m-msg" name="message" rows={5} required maxLength={2000} /></div>
            </div>
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <SubmitButton className="btn rust" pendingText="Sending...">Send message</SubmitButton>
          </ActionForm>
        </div>
      </section>
      <section className="section soft tight"><div className="wrap"><MapEmbed s={s} /></div></section>
    </>
  );
}
