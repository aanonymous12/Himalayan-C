import ActionForm, { SubmitButton } from '@/components/ActionForm';
import MediaUpload from '@/components/admin/MediaUpload';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireAdmin } from '@/lib/auth';
import { savePost, deletePost } from '../actions';

function PostForm({ post }) {
  return (
    <ActionForm action={savePost} resetOnSuccess={!post}>
      {post && <><input type="hidden" name="id" value={post.id} /><input type="hidden" name="published_at" value={post.published_at || ''} /></>}
      <div className="field"><label>Title</label><input name="title" required maxLength={120} defaultValue={post?.title} /></div>
      <div className="field"><label>Short summary (shown on cards and as the intro)</label><input name="excerpt" maxLength={300} defaultValue={post?.excerpt || ''} /></div>
      <MediaUpload name="cover_url" label="Cover photo (16:9 works best, at least 1200 px wide)" kind="image" initial={post?.cover_url} />
      <div className="field"><label>Describe the cover photo (for accessibility and Google Images)</label><input name="cover_alt" maxLength={160} defaultValue={post?.cover_alt || ''} placeholder="Steamed chicken momos with tomato achar" /></div>
      <div className="field"><label>Article</label><textarea name="body" rows={14} required defaultValue={post?.body} />
        <span className="hint">Blank line = new paragraph. <code>## Heading</code>, <code>### Smaller heading</code>, lines starting with <code>- </code> make a bullet list, <code>1. </code> a numbered list, <code>&gt; </code> a quote. <code>**bold**</code> and <code>[link text](https://...)</code> work inside text. Headings build the table of contents automatically.</span></div>
      <fieldset className="seo-box"><legend>Search and sharing (optional)</legend>
        <div className="field"><label>Search title (about 50 to 60 characters)</label><input name="seo_title" maxLength={70} defaultValue={post?.seo_title || ''} placeholder="Leave empty to use the article title" /></div>
        <div className="field" style={{ marginBottom: 0 }}><label>Search description (about 140 to 160 characters)</label><textarea name="seo_description" rows={2} maxLength={170} defaultValue={post?.seo_description || ''} placeholder="Leave empty to use the short summary" /></div>
        <span className="hint">This is what Google shows and what appears when the link is shared on Facebook, WhatsApp, X, iMessage and LinkedIn, together with the cover photo.</span>
      </fieldset>
      <div className="checks">
        <label><input type="checkbox" name="published" defaultChecked={post?.published} /> Published (visible on the website)</label>
        <label><input type="checkbox" name="show_on_home" defaultChecked={post ? post.show_on_home : true} /> Show on the home page</label>
      </div>
      <div className="row"><SubmitButton className="btn sm">{post ? 'Save article' : 'Create article'}</SubmitButton>{post && <DeleteButton action={deletePost} id={post.id} label="Delete article" />}</div>
    </ActionForm>
  );
}

export default async function AdminBlog() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('posts').select('*').order('created_at', { ascending: false });
  const posts = data ?? [];
  return (
    <>
      <h1 style={{ marginBottom: '.5rem' }}>Blog</h1>
      <p className="muted">Articles help your restaurant show up in Google searches. Tick &quot;Show on the home page&quot; for the ones you want featured there; all others stay under &quot;See more&quot; on the Blog page.</p>
      <details className="edit" open={posts.length === 0} style={{ margin: '1.25rem 0 2rem' }}><summary><b>Write a new article</b></summary><PostForm /></details>
      {posts.map((p) => (
        <details className="edit" key={p.id}>
          <summary><span>{p.title}</span><span className="muted">{p.published ? 'Published' : 'Draft'}{p.published && p.show_on_home && <span className="badge">On home page</span>}</span></summary>
          <PostForm post={p} />
        </details>
      ))}
    </>
  );
}
