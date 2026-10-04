import ActionForm, { SubmitButton } from '@/components/ActionForm';
import DeleteButton from './DeleteButton';
import { savePromo, deletePromo } from '@/app/admin/actions';

export default function PromoForm({ p }) {
  return (
    <ActionForm action={savePromo} resetOnSuccess={!p}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid2">
        <div className="field"><label>Code customers type</label><input name="code" required defaultValue={p?.code} placeholder="WELCOME10" style={{ textTransform: 'uppercase' }} /></div>
        <div className="field"><label>Note for yourself (optional)</label><input name="description" defaultValue={p?.description || ''} placeholder="Instagram giveaway" /></div>
        <div className="field"><label>Discount type</label><select name="kind" defaultValue={p?.kind || 'percent'}><option value="percent">Percent off the food total</option><option value="amount">Dollar amount off</option></select></div>
        <div className="field"><label>Discount value</label><input name="value" type="number" step="0.01" min="0.01" required defaultValue={p?.value} placeholder="10" /><span className="hint">10 means 10% or $10, depending on the type.</span></div>
        <div className="field"><label>Minimum order ($)</label><input name="min_subtotal" type="number" step="0.01" min="0" defaultValue={p?.min_subtotal ?? 0} /></div>
        <div className="field"><label>Total uses allowed</label><input name="max_uses" type="number" min="1" defaultValue={p?.max_uses ?? ''} placeholder="Unlimited" /><span className="hint">How many customers can use it before it stops working.</span></div>
        <div className="field"><label>Uses per customer (by phone number)</label><input name="per_phone" type="number" min="1" defaultValue={p ? (p.per_phone ?? '') : 1} placeholder="Unlimited" /></div>
        <div className="field"><label>&nbsp;</label><label className="check-inline"><input type="checkbox" name="active" defaultChecked={p ? p.active : true} /> Code is switched on</label></div>
        <div className="field"><label>Starts on (optional)</label><input name="starts_on" type="date" defaultValue={p?.starts_on || ''} /></div>
        <div className="field"><label>Expires on (optional, last day it works)</label><input name="expires_on" type="date" defaultValue={p?.expires_on || ''} /></div>
      </div>
      <div className="row">
        <SubmitButton className="btn sm">{p ? 'Save code' : 'Create code'}</SubmitButton>
        {p && <DeleteButton action={deletePromo} id={p.id} label="Delete" confirmText={`Delete ${p.code}? Past orders keep their discount.`} />}
      </div>
    </ActionForm>
  );
}
