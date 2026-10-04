import ActionForm, { SubmitButton } from '@/components/ActionForm';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireAdmin } from '@/lib/auth';
import { stars } from '@/lib/format';
import { saveReview, toggleReview, deleteReview } from '../actions';

export default async function AdminReviews() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
  const list = data ?? [];
  return (
    <>
      <h1 style={{ marginBottom: ".5rem" }}>Testimonials</h1>
      <p className="muted">Add real guest reviews to show on the home and Reviews pages. Only add reviews from real customers.</p>
      <details className="edit" open={list.length === 0} style={{ margin: '1.25rem 0 2rem' }}>
        <summary><b>Add a review</b></summary>
        <ActionForm action={saveReview} resetOnSuccess>
          <div className="grid2">
            <div className="field"><label>Customer name</label><input name="author" required placeholder="Maria G." /></div>
            <div className="field"><label>Rating</label><select name="rating" defaultValue="5">{[5, 4, 3].map((n) => <option key={n} value={n}>{n} stars</option>)}</select></div>
          </div>
          <div className="field"><label>What they said</label><textarea name="body" rows={3} maxLength={700} required /></div>
          <div className="field"><label>Where it came from</label><select name="source" defaultValue="google"><option value="google">Google</option><option value="website">Website / in person</option></select></div>
          <SubmitButton className="btn sm">Add review</SubmitButton>
        </ActionForm>
      </details>
      {list.map((r) => (
        <div className="order" key={r.id} style={{ opacity: r.published ? 1 : .55 }}>
          <div className="order-top"><b>{r.author} <span className="stars">{stars(r.rating)}</span></b><span className="muted">{r.source}</span></div>
          <p style={{ margin: '.4rem 0 .75rem' }}>{r.body}</p>
          <div className="row">
            <form action={toggleReview}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="published" value={String(r.published)} /><button className="btn sm line">{r.published ? 'Hide' : 'Show'}</button></form>
            <DeleteButton action={deleteReview} id={r.id} />
          </div>
        </div>
      ))}
    </>
  );
}
