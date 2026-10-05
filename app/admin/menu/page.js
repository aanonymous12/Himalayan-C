import ActionForm, { SubmitButton } from '@/components/ActionForm';
import ItemForm from '@/components/admin/ItemForm';
import DeleteButton from '@/components/admin/DeleteButton';
import MoveButtons from '@/components/admin/MoveButtons';
import { requireAdmin } from '@/lib/auth';
import { money } from '@/lib/format';
import { saveCategory, deleteCategory, toggleAvailable, moveCategory, moveItem, duplicateItem } from '../actions';

export default async function AdminMenu() {
  const { sb } = await requireAdmin();
  const [{ data: catsData }, { data: itemsData }] = await Promise.all([
    sb.from('menu_categories').select('*').order('sort_order').order('name'),
    sb.from('menu_items').select('*').order('sort_order').order('name'),
  ]);
  const cats = catsData ?? [], items = itemsData ?? [];
  const priceText = (i) => (i.options?.length ? i.options.map((o) => `${o.label} ${money(o.price)}`).join(' / ') : money(i.price));

  return (
    <>
      <div className="page-head"><div><h1>Menu</h1><p className="muted">Everything here appears on the website immediately. Use the arrows to reorder.</p></div></div>

      <details className="edit" open={cats.length === 0}>
        <summary><b>+ Add a category</b></summary>
        <ActionForm action={saveCategory} resetOnSuccess>
          <div className="grid2">
            <div className="field"><label>Name</label><input name="name" required placeholder="Momo" /></div>
            <div className="field"><label>Short note (optional)</label><input name="description" placeholder="Handmade Himalayan dumplings" /></div>
          </div>
          <input type="hidden" name="sort_order" value={(cats.length + 1) * 10} />
          <SubmitButton className="btn sm">Add category</SubmitButton>
        </ActionForm>
      </details>

      {cats.length === 0 && <div className="error">No categories yet. Add one above, then add dishes to it.</div>}

      {cats.map((c) => {
        const list = items.filter((i) => i.category_id === c.id);
        return (
          <section key={c.id}>
            <div className="menu-cat-head">
              <div><h2>{c.name} {!c.visible && <span className="chip-s">Hidden</span>}</h2><span className="muted">{list.length} {list.length === 1 ? 'dish' : 'dishes'}</span></div>
              <MoveButtons action={moveCategory} id={c.id} />
            </div>
            <details className="edit">
              <summary>Edit category</summary>
              <ActionForm action={saveCategory}>
                <input type="hidden" name="id" value={c.id} /><input type="hidden" name="sort_order" value={c.sort_order} />
                <div className="grid2">
                  <div className="field"><label>Name</label><input name="name" required defaultValue={c.name} /></div>
                  <div className="field"><label>Short note</label><input name="description" defaultValue={c.description || ''} /></div>
                </div>
                <div className="checks"><label><input type="checkbox" name="visible" defaultChecked={c.visible} /> Show on website</label></div>
                <div className="row"><SubmitButton className="btn sm">Save category</SubmitButton>
                  <DeleteButton action={deleteCategory} id={c.id} label="Delete category" confirmText={`Delete ${c.name} and all ${list.length} dishes in it?`} /></div>
              </ActionForm>
            </details>
            {list.map((i) => (
              <details className="edit" key={i.id}>
                <summary>
                  <span className="sum-main">
                    {i.image_url ? <img className="thumb" src={i.image_url} alt="" /> : <span className="thumb" />}
                    <span><b>{i.name}</b>
                      {!i.available && <span className="chip-s red">Sold out</span>}
                      {i.vegetarian && <span className="chip-s">Veg</span>}
                      {i.featured && <span className="chip-s gold">On home page</span>}</span>
                  </span>
                  <span className="muted">{priceText(i)}</span>
                </summary>
                <div className="row item-tools">
                  <MoveButtons action={moveItem} id={i.id} />
                  <form action={toggleAvailable}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="available" value={String(i.available)} />
                    <button className="btn sm line">{i.available ? 'Mark sold out' : 'Mark available'}</button></form>
                  <form action={duplicateItem}><input type="hidden" name="id" value={i.id} /><button className="btn sm line">Duplicate</button></form>
                </div>
                <ItemForm item={i} categories={cats} />
              </details>
            ))}
            <details className="edit"><summary><b>+ Add a dish to {c.name}</b></summary><ItemForm categories={cats} categoryId={c.id} /></details>
          </section>
        );
      })}
    </>
  );
}
