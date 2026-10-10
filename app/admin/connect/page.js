import ActionForm, { SubmitButton } from '@/components/ActionForm';
import MediaUpload from '@/components/admin/MediaUpload';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import SocialsEditor from '@/components/admin/SocialsEditor';
import { guessPlatform } from '@/lib/socials';
import { saveConnect } from '../actions';

export default async function AdminConnect() {
  await requireAdmin();
  const s = await getSettings();
  const c = s.connect || {};
  const show = { order: true, reserve: true, review: true, directions: true, call: true, ...(c.show || {}) };
  const socials = c.socials || (c.links || []).map((l) => ({ platform: guessPlatform(l.url), url: l.url }));
  return (
    <>
      <div className="page-head">
        <div><h1>Business card</h1><p className="muted">A phone-friendly page for NFC cards, table QR codes and your social bios. Guests can save your contact, share it, order and find you in one tap.</p></div>
        <a className="btn sm rust" href="/connect" target="_blank" rel="noopener noreferrer">Open the card</a>
      </div>
      <ActionForm action={saveConnect}>
        <div style={{ maxWidth: 700 }}>
          <MediaUpload name="cover_url" label="Cover photo (wide)" kind="image" initial={c.cover_url} hint="A wide photo of your food or dining room. Leave empty for a plain brown banner." />
          <MediaUpload name="logo_url" label="Logo or round photo" kind="image" initial={c.logo_url} hint="A square image works best. Leave empty to show the first letter of your name." />
          <div className="grid2">
            <div className="field"><label>Name on the card</label><input name="name" maxLength={60} defaultValue={c.name || ''} placeholder={s.business_name} /></div>
            <div className="field"><label>Tagline</label><input name="tagline" maxLength={60} defaultValue={c.tagline || ''} placeholder="Fresh Himalayan cooking" /></div>
          </div>
          <div className="field"><label>Short intro</label><textarea name="bio" rows={3} maxLength={400} defaultValue={c.bio || ''} placeholder="Leave empty to use your story from Settings." /></div>

          <div className="field"><span className="lbl">Buttons to show</span>
            <div className="checks">
              <label><input type="checkbox" name="show_order" defaultChecked={show.order} /> Order online</label>
              <label><input type="checkbox" name="show_reserve" defaultChecked={show.reserve} /> Reserve a table</label>
              <label><input type="checkbox" name="show_call" defaultChecked={show.call} /> Call us</label>
              <label><input type="checkbox" name="show_directions" defaultChecked={show.directions} /> Directions</label>
              <label><input type="checkbox" name="show_review" defaultChecked={show.review} /> Leave a review</label>
            </div>
          </div>
          <SocialsEditor initial={socials} />
          <SubmitButton className="btn">Save business card</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
