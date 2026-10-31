import ActionForm, { SubmitButton } from '@/components/ActionForm';
import MediaUpload from './MediaUpload';
import DeleteButton from './DeleteButton';
import { saveItem, deleteItem } from '@/app/admin/actions';

// Used for both "add dish" and "edit dish". Errors appear under the form, never as a crash page.
export default function ItemForm({ item, categories, categoryId, others = [] }) {
  const paired = new Set(Array.isArray(item?.pairs) ? item.pairs : []);
  const choices = others.filter((o) => o.id !== item?.id);
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
      <div className="grid2">
        <div className="field"><label>Spice levels (comma separated)</label><input name="spice_levels" placeholder="Mild, Medium, Hot, Extra hot" defaultValue={(item?.spice_levels || []).join(', ')} /><span className="hint">Leave empty if spice does not apply. Customers must pick one.</span></div>
        <div className="field"><label>Add-ons (one per line)</label><textarea name="addons" rows={3} placeholder={'Extra naan | 2.50\nExtra chutney | 1'} defaultValue={(item?.addons || []).map((a) => `${a.label} | ${a.price}`).join('\n')} /><span className="hint">Optional extras customers can tick. Use 0 for free.</span></div>
      </div>
      <MediaUpload name="image_url" label="Photo" initial={item?.image_url} bucket="menu" kind="image" hint="Resized automatically. Landscape photos look best." />
      <div className="grid2">
        <div className="field"><label>Dietary tags (comma separated)</label><input name="tags" placeholder="Gluten free, Spicy" defaultValue={(item?.tags || []).join(', ')} /></div>
        <div className="field"><label>Order on menu</label><input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} /></div>
      </div>
      {choices.length > 0 && (
        <details className="pair-pick">
          <summary><b>Goes well with</b> <span className="muted">{paired.size ? `${paired.size} chosen` : 'optional'}</span></summary>
          <p className="hint">When a guest has this dish in their cart, these are suggested first in &quot;Complete your meal&quot; (for example naan with a curry, or a dip with momo).</p>
          <div className="pair-list">
            {categories.map((c) => {
              const list = choices.filter((o) => o.category_id === c.id);
              return list.length ? (
                <div key={c.id}><h4>{c.name}</h4>
                  {list.map((o) => <label key={o.id}><input type="checkbox" name="pairs" value={o.id} defaultChecked={paired.has(o.id)} /> {o.name}</label>)}</div>
              ) : null;
            })}
          </div>
        </details>
      )}
      <div className="checks">
        <label><input type="checkbox" name="available" defaultChecked={item ? item.available : true} /> Available</label>
        <label><input type="checkbox" name="vegetarian" defaultChecked={item?.vegetarian} /> Vegetarian</label>
        <label><input type="checkbox" name="featured" defaultChecked={item?.featured} /> Show on the home page menu</label>
        <input type="hidden" name="upsell_present" value="1" />
        <label><input type="checkbox" name="upsell" defaultChecked={item?.upsell} /> Offer to everyone at checkout</label>
      </div>
      <div className="row">
        <SubmitButton className="btn sm">{item ? 'Save changes' : 'Add dish'}</SubmitButton>
        {item && <DeleteButton action={deleteItem} id={item.id} label="Delete dish" confirmText={`Delete ${item.name}?`} />}
      </div>
    </ActionForm>
  );
}
