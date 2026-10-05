import Link from 'next/link';
import Icon from '@/components/Icon';
import ShareButton from '@/components/ShareButton';
import { directionsUrl } from '@/components/InfoList';
import { getSettings } from '@/lib/settings';
import { telHref } from '@/lib/format';

export async function generateMetadata() {
  const s = await getSettings();
  return { title: `${s.connect?.name || s.business_name} | Connect`, robots: { index: false, follow: false } };
}

// A phone-friendly "business card" for NFC tags and QR codes. Everything on it is edited in the dashboard.
export default async function Connect() {
  const s = await getSettings();
  const c = s.connect || {};
  const show = { order: true, reserve: true, review: true, directions: true, call: true, ...(c.show || {}) };
  const name = c.name || s.business_name;
  const place = s.address.split('\n').pop();
  const bio = c.bio || s.story;

  const social = [
    s.instagram_url && ['Instagram', s.instagram_url, 'instagram'],
    s.facebook_url && ['Facebook', s.facebook_url, 'facebook'],
    s.google_review_url && ['Google', s.google_review_url, 'star'],
    s.doordash_url && ['Delivery', s.doordash_url, 'truck'],
    ...(c.links || []).map((l) => [l.label, l.url, 'external']),
  ].filter(Boolean);

  const actions = [
    show.order && ['Order online', '/menu', 'bag', false],
    show.reserve && s.reservations_enabled && ['Reserve a table', '/#reservation', 'calendar', false],
    show.call && ['Call us', telHref(s.phone), 'phone', false],
    show.directions && ['Directions', directionsUrl(s), 'pin', true],
    show.review && ['Leave a review', s.google_review_url || '/review', 'star', !!s.google_review_url],
  ].filter(Boolean);

  return (
    <div className="cc-page">
      <article className="cc">
        <div className="cc-cover" style={c.cover_url ? { backgroundImage: `url(${c.cover_url})` } : undefined} />
        <div className="cc-avatar">{c.logo_url ? <img src={c.logo_url} alt={name} /> : <span>{name.slice(0, 1)}</span>}</div>
        <header className="cc-head">
          <h1>{name}</h1>
          {(c.tagline || 'Fresh Himalayan cooking') && <p className="cc-tag">{c.tagline || 'Fresh Himalayan cooking'}</p>}
          <p className="cc-place"><Icon name="pin" size={15} />{place}</p>
          {bio && <p className="cc-bio">{bio}</p>}
        </header>

        <div className="cc-actions">
          <a href="/connect/vcard" className="cc-btn primary"><Icon name="user" size={20} /><span>Save contact</span></a>
          <ShareButton title={name} text={`${name} - ${c.tagline || 'Fresh Himalayan cooking'}`} />
        </div>

        {actions.length > 0 && (
          <section>
            <h2 className="cc-h">Order and visit</h2>
            <div className="cc-grid">
              {actions.map(([label, href, icon, ext]) => (
                <a key={label} href={href} className="cc-tile" {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><Icon name={icon} size={24} /><span>{label}</span></a>
              ))}
            </div>
          </section>
        )}

        {social.length > 0 && (
          <section>
            <h2 className="cc-h">Follow us</h2>
            <div className="cc-grid">
              {social.map(([label, href, icon]) => <a key={label + href} href={href} className="cc-tile" target="_blank" rel="noopener noreferrer"><Icon name={icon} size={24} /><span>{label}</span></a>)}
            </div>
          </section>
        )}

        <section>
          <h2 className="cc-h">Contact details</h2>
          <a className="cc-row" href={telHref(s.phone)}><span className="cc-ico"><Icon name="phone" size={20} /></span><span><small>Phone</small>{s.phone}</span><Icon name="chevron" size={18} /></a>
          {s.email && <a className="cc-row" href={`mailto:${s.email}`}><span className="cc-ico"><Icon name="mail" size={20} /></span><span><small>Email</small>{s.email}</span><Icon name="chevron" size={18} /></a>}
          <a className="cc-row" href={directionsUrl(s)} target="_blank" rel="noopener noreferrer"><span className="cc-ico"><Icon name="pin" size={20} /></span><span><small>Address</small>{s.address.replace('\n', ', ')}</span><Icon name="chevron" size={18} /></a>
          <div className="cc-row"><span className="cc-ico"><Icon name="clock" size={20} /></span><span><small>Hours</small><span className="pre">{s.hours}</span></span></div>
        </section>

        <div className="cc-foot"><Link href="/">Visit our website</Link></div>
      </article>
    </div>
  );
}
