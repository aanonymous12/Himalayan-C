import ActionForm, { SubmitButton } from '@/components/ActionForm';
import ItemForm from '@/components/admin/ItemForm';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireAdmin } from '@/lib/auth';
import { money } from '@/lib/format';
import { saveCategory, deleteCategory, toggleAvailable } from '../actions';

export default async function AdminMenu() {
  const { sb } = await requireAdmin();
  const [{ data: catsData }, { data: itemsData }] = await Promise.all([
    sb.from('menu_categories').select('*').order('sort_order'),
    sb.from('menu_items').select('*').order('sort_order'),
  ]);
  const cats = catsData ?? [], items = itemsData ?? [];
  const priceText = (i) => (i.options?.length ? i.options.map((o) => `${o.label} ${money(o.price)}`).join(', ') : money(i.price));

  return (
    <>
      <h1 style={{ marginBottom: '.5rem' }}>Menu</h1>
      <p className="muted">Changes show on the website right away. Use &ldquo;Mark sold out&rdquo; for the day instead of deleting.</p>

      <details className="edit" style={{ margin: '1.25rem 0 2rem' }}>
        <summary><b>Add a category</b></summary>
        <ActionForm action={saveCategory} resetOnSuccess>
          <div className="grid2">
            <div className="field"><label>Name</label><input name="name" required /></div>
            <div className="field"><label>Order on menu</label><input name="sort_order" type="number" defaultValue={cats.length + 1} /></div>
          </div>
          <div className="field"><label>Short note (optional)</label><input name="description" /></div>
          <SubmitButton className="btn sm">Add category</SubmitButton>
        </ActionForm>
      </details>

      {cats.length === 0 && <div className="error">No categories yet. Add one above, then you can add dishes to it.</div>}

      {cats.map((c) => (
        <section key={c.id} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>{c.name} {!c.visible && <span className="muted">(hidden)</span>}</h2>
          <details className="edit">
            <summary>Edit category</summary>
            <ActionForm action={saveCategory}>
              <input type="hidden" name="id" value={c.id} />
              <div className="grid2">
                <div className="field"><label>Name</label><input name="name" required defaultValue={c.name} /></div>
                <div className="field"><label>Order on menu</label><input name="sort_order" type="number" defaultValue={c.sort_order} /></div>
              </div>
              <div className="field"><label>Short note</label><input name="description" defaultValue={c.description || ''} /></div>
              <div className="checks"><label><input type="checkbox" name="visible" defaultChecked={c.visible} /> Show on website</label></div>
              <div className="row"><SubmitButton className="btn sm">Save category</SubmitButton>
                <DeleteButton action={deleteCategory} id={c.id} label="Delete category" confirmText={`Delete ${c.name} and all its dishes?`} /></div>
            </ActionForm>
          </details>
          {items.filter((i) => i.category_id === c.id).map((i) => (
            <details className="edit" key={i.id}>
              <summary>
                <span>{i.name} {!i.available && <span className="soldout">sold out</span>}</span>
                <span className="muted">{priceText(i)}</span>
              </summary>
              <form action={toggleAvailable} style={{ padding: '0 .9rem .5rem' }}>
                <input type="hidden" name="id" value={i.id} /><input type="hidden" name="available" value={String(i.available)} />
                <button className="btn sm line">{i.available ? 'Mark sold out' : 'Mark available again'}</button>
              </form>
              <ItemForm item={i} categories={cats} />
            </details>
          ))}
          <details className="edit">
            <summary><b>Add a dish to {c.name}</b></summary>
            <ItemForm categories={cats} categoryId={c.id} />
          </details>
        </section>
      ))}
    </>
  );
}
