import ActionForm, { SubmitButton } from '@/components/ActionForm';
import MediaUpload from './MediaUpload';
import DeleteButton from './DeleteButton';
import { saveItem, deleteItem } from '@/app/admin/actions';

// Used for both "add dish" and "edit dish". Errors appear under the form, never as a crash page.
export default function ItemForm({ item, categories, categoryId }) {
  const opts = (item?.options || []).map((o) => `${o.label} | ${o.price}`).join('\n');
  return (
    <ActionForm action={saveItem} resetOnSuccess={!item}>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid2">
        <div className="field"><label>Name</label><input name="name" required defaultValue={item?.name} /></div>
        <div className="field"><label>Category</label>
          <select name="category_id" defaultValue={item?.category_id || categoryId}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      </div>
      <div className="field"><label>Description</label><textarea name="description" rows={2} maxLength={400} defaultValue={item?.description || ''} /></div>
      <div className="grid2">
        <div className="field"><label>Price</label><input name="price" type="number" step="0.01" min="0" defaultValue={item?.price ?? ''} /><span className="hint">Leave empty if the dish has options.</span></div>
        <div className="field"><label>Options (one per line)</label><textarea name="options" rows={3} placeholder={'Chicken | 14.99\nLamb/Goat | 15.99'} defaultValue={opts} /></div>
      </div>
      <MediaUpload name="image_url" label="Photo" initial={item?.image_url} bucket="menu" kind="image" hint="Resized automatically. Landscape photos look best." />
      <div className="grid2">
        <div className="field"><label>Dietary tags (comma separated)</label><input name="tags" placeholder="Gluten free, Spicy" defaultValue={(item?.tags || []).join(', ')} /></div>
        <div className="field"><label>Order on menu</label><input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} /></div>
      </div>
      <div className="checks">
        <label><input type="checkbox" name="available" defaultChecked={item ? item.available : true} /> Available</label>
        <label><input type="checkbox" name="vegetarian" defaultChecked={item?.vegetarian} /> Vegetarian</label>
        <label><input type="checkbox" name="featured" defaultChecked={item?.featured} /> Popular (shown on home page)</label>
      </div>
      <div className="row">
        <SubmitButton className="btn sm">{item ? 'Save changes' : 'Add dish'}</SubmitButton>
        {item && <DeleteButton action={deleteItem} id={item.id} label="Delete dish" confirmText={`Delete ${item.name}?`} />}
      </div>
    </ActionForm>
  );
}
