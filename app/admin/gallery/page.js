import ActionForm, { SubmitButton } from '@/components/ActionForm';
import MediaUpload from '@/components/admin/MediaUpload';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireAdmin } from '@/lib/auth';
import { saveGalleryItem, toggleGallery, toggleGalleryHome, deleteGalleryItem } from '../actions';

export default async function AdminGallery() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('gallery_items').select('*').order('sort_order').order('created_at', { ascending: false });
  const list = data ?? [];
  return (
    <>
      <h1 style={{ marginBottom: '.5rem' }}>Gallery</h1>
      <p className="muted">Every visible item appears on the Gallery page. Choose which ones also appear on the home page; visitors get a "Show more" button that opens the full gallery.</p>
      <details className="edit" open style={{ margin: '1.25rem 0 2rem' }}>
        <summary><b>Add a photo or video</b></summary>
        <ActionForm action={saveGalleryItem} resetOnSuccess>
          <MediaUpload name="url" typeName="media_type" label="Photo or video" kind="both" bucket="site" hint="Photos are resized automatically. Videos: MP4 or WebM under 50 MB." />
          <div className="grid2">
            <div className="field"><label>Category</label><select name="category"><option value="food">Food</option><option value="restaurant">Restaurant</option><option value="events">Events</option></select></div>
            <div className="field"><label>Caption (optional)</label><input name="caption" maxLength={120} /></div>
          </div>
          <label className="check-row" style={{ marginTop: 0 }}><input type="checkbox" name="show_on_home" defaultChecked /><span>Show on the home page</span></label>
          <div style={{ marginTop: '1rem' }}><SubmitButton className="btn sm">Add to gallery</SubmitButton></div>
        </ActionForm>
      </details>
      <div className="cards c3">
        {list.map((g) => (
          <div key={g.id} className="order" style={{ opacity: g.visible ? 1 : .55, margin: 0 }}>
            {g.media_type === 'video' ? <video src={g.url} muted playsInline preload="metadata" style={{ width: '100%', borderRadius: 8 }} /> : <img src={g.url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8 }} />}
            <p className="muted" style={{ margin: '.5rem 0' }}>{g.category}{g.caption ? `: ${g.caption}` : ''} {g.show_on_home && <span className="badge">On home page</span>}</p>
            <div className="row">
              <form action={toggleGalleryHome}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="home" value={String(!!g.show_on_home)} /><button className="btn sm line">{g.show_on_home ? 'Remove from home' : 'Show on home'}</button></form>
              <form action={toggleGallery}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="visible" value={String(g.visible)} /><button className="btn sm line">{g.visible ? 'Hide' : 'Show'}</button></form>
              <DeleteButton action={deleteGalleryItem} id={g.id} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
