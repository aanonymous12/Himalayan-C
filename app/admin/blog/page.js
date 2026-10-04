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
      <div className="field"><label>Short summary (shows on the Journal page and in Google)</label><input name="excerpt" maxLength={300} defaultValue={post?.excerpt || ''} /></div>
      <MediaUpload name="cover_url" label="Cover photo" kind="image" initial={post?.cover_url} />
      <div className="field"><label>Article</label><textarea name="body" rows={10} required defaultValue={post?.body} /><span className="hint">Leave a blank line between paragraphs. Start a line with ## to make a heading.</span></div>
      <div className="checks"><label><input type="checkbox" name="published" defaultChecked={post?.published} /> Published (visible on the website)</label></div>
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
      <h1 style={{ marginBottom: '.5rem' }}>Journal</h1>
      <p className="muted">Articles help your restaurant show up in Google searches. Aim for helpful posts about dishes, ingredients and events.</p>
      <details className="edit" open={posts.length === 0} style={{ margin: '1.25rem 0 2rem' }}><summary><b>Write a new article</b></summary><PostForm /></details>
      {posts.map((p) => (
        <details className="edit" key={p.id}>
          <summary><span>{p.title}</span><span className="muted">{p.published ? 'Published' : 'Draft'}</span></summary>
          <PostForm post={p} />
        </details>
      ))}
    </>
  );
}
