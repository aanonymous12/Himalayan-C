import ActionForm, { SubmitButton } from '@/components/ActionForm';
import MediaUpload from '@/components/admin/MediaUpload';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { closedDays } from '@/lib/format';
import PasswordForm from '@/components/PasswordForm';
import { saveSettings } from '../actions';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const H = { fontSize: '1.4rem', margin: '2.25rem 0 1rem' };

export default async function AdminSettings() {
  await requireAdmin();
  const s = await getSettings();
  const closed = closedDays(s.closed_days);
  return (
    <>
      <h1 style={{ marginBottom: '1rem' }}>Settings</h1>
      <ActionForm action={saveSettings}>
        <div style={{ maxWidth: 700 }}>
          <h2 style={{ ...H, marginTop: 0 }}>Home page</h2>
          <div className="field"><label htmlFor="hero_title">Headline</label><input id="hero_title" name="hero_title" defaultValue={s.hero_title} maxLength={80} /></div>
          <div className="field"><label htmlFor="hero_subtitle">Line under the headline</label><input id="hero_subtitle" name="hero_subtitle" defaultValue={s.hero_subtitle} maxLength={120} /></div>
          <MediaUpload name="hero_video_url" label="Background video (optional)" kind="video" initial={s.hero_video_url} hint="MP4 or WebM, 10 to 20 second loop, 1080p, under 15 MB. Plays muted behind the headline." />
          <MediaUpload name="hero_image_url" label="Background photo (used when there is no video)" kind="image" initial={s.hero_image_url} hint="A wide, dark-ish food or restaurant photo works best. Without a video or photo the hero is plain dark brown." />
          <MediaUpload name="about_image_url" label="Restaurant photo (home and About pages)" kind="image" initial={s.about_image_url} />

          <h2 style={H}>Ordering and bookings</h2>
          <div className="checks">
            <label><input type="checkbox" name="accepting_orders" defaultChecked={s.accepting_orders} /> <b>Accept online orders</b></label>
            <label><input type="checkbox" name="reservations_enabled" defaultChecked={s.reservations_enabled} /> Accept reservations</label>
            <label><input type="checkbox" name="catering_enabled" defaultChecked={s.catering_enabled} /> Accept catering requests</label>
          </div>
          <div className="grid2">
            <div className="field"><label htmlFor="tax_percent">Sales tax %</label><input id="tax_percent" name="tax_percent" type="number" step="0.01" defaultValue={(Number(s.tax_rate) * 100).toFixed(2)} /></div>
            <div className="field"><label htmlFor="announcement">Banner across the top</label><input id="announcement" name="announcement" defaultValue={s.announcement} placeholder="Closed Thursday for a private event" /></div>
          </div>

          <h2 style={H}>Restaurant details</h2>
          <div className="grid2">
            <div className="field"><label htmlFor="business_name">Business name</label><input id="business_name" name="business_name" defaultValue={s.business_name} /></div>
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" defaultValue={s.phone} /></div>
          </div>
          <div className="field"><label htmlFor="email">Email (order, reservation and message alerts go here)</label><input id="email" name="email" type="email" defaultValue={s.email} /></div>
          <div className="field"><label htmlFor="address">Address</label><textarea id="address" name="address" rows={2} defaultValue={s.address} /></div>
          <div className="field"><label htmlFor="hours">Hours shown on the website</label><textarea id="hours" name="hours" rows={3} defaultValue={s.hours} /></div>
          <div className="grid2">
            <div className="field"><label htmlFor="open_time">Opens (for reservation times)</label><input id="open_time" name="open_time" type="time" defaultValue={s.open_time} /></div>
            <div className="field"><label htmlFor="close_time">Closes</label><input id="close_time" name="close_time" type="time" defaultValue={s.close_time} /></div>
          </div>
          <div className="field"><label htmlFor="closed_dates">Closed on specific dates (holidays, private events)</label><input id="closed_dates" name="closed_dates" defaultValue={s.closed_dates} placeholder="2026-12-25, 2027-01-01" /><span className="hint">Format 2026-12-25, separated by commas. Guests cannot reserve on these dates.</span></div>
          <div className="field"><span className="lbl">Closed on</span>
            <div className="checks">{DAYS.map((d, i) => <label key={d}><input type="checkbox" name="closed" value={i} defaultChecked={closed.includes(i)} /> {d}</label>)}</div></div>

          <h2 style={H}>Story</h2>
          <div className="field"><label htmlFor="story">Our story</label><textarea id="story" name="story" rows={5} defaultValue={s.story} /></div>
          <div className="field"><label htmlFor="philosophy">Philosophy (About page)</label><textarea id="philosophy" name="philosophy" rows={3} defaultValue={s.philosophy} /></div>

          <h2 style={H}>Links</h2>
          <div className="field"><label htmlFor="google_review_url">Google review link</label><input id="google_review_url" name="google_review_url" type="url" defaultValue={s.google_review_url} placeholder="https://g.page/r/..." /><span className="hint">Happy guests on the /review page are sent here. Find it in your Google Business Profile under &ldquo;Ask for reviews&rdquo;.</span></div>
          <div className="grid2">
            <div className="field"><label htmlFor="instagram_url">Instagram</label><input id="instagram_url" name="instagram_url" type="url" defaultValue={s.instagram_url} /></div>
            <div className="field"><label htmlFor="facebook_url">Facebook</label><input id="facebook_url" name="facebook_url" type="url" defaultValue={s.facebook_url} /></div>
          </div>
          <div className="field"><label htmlFor="doordash_url">DoorDash store link (optional)</label><input id="doordash_url" name="doordash_url" type="url" defaultValue={s.doordash_url} /></div>
          <SubmitButton className="btn">Save settings</SubmitButton>
        </div>
      </ActionForm>
      <div className="panel" id="password" style={{ maxWidth: 700, marginTop: '2.5rem' }}><PasswordForm heading="Change your password" /></div>
    </>
  );
}
