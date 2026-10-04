import ActionForm, { SubmitButton } from '@/components/ActionForm';
import { saveReservation } from '@/app/admin/actions';
import { RES_STATUSES, RES_LABEL } from '@/lib/format';

// Used to add a reservation (for phone bookings) and to edit or reschedule an existing one.
export default function ReservationEditor({ r }) {
  return (
    <ActionForm action={saveReservation} resetOnSuccess={!r}>
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="grid2">
        <div className="field"><label>Guest name</label><input name="name" required defaultValue={r?.name} /></div>
        <div className="field"><label>Phone</label><input name="phone" type="tel" required defaultValue={r?.phone} /></div>
        <div className="field"><label>Email</label><input name="email" type="email" defaultValue={r?.email || ''} /></div>
        <div className="field"><label>Type</label><select name="kind" defaultValue={r?.kind || 'table'}><option value="table">Table</option><option value="event">Event</option></select></div>
        <div className="field"><label>Date</label><input name="res_date" type="date" required defaultValue={r?.res_date} /></div>
        <div className="field"><label>Time</label><input name="res_time" type="time" step="900" required defaultValue={r ? String(r.res_time).slice(0, 5) : ''} /></div>
        <div className="field"><label>Guests</label><input name="party_size" type="number" min="1" max="500" required defaultValue={r?.party_size ?? 2} /></div>
        <div className="field"><label>Event type (events only)</label><input name="event_type" defaultValue={r?.event_type || ''} /></div>
      </div>
      <div className="field"><label>Notes</label><textarea name="notes" rows={2} maxLength={500} defaultValue={r?.notes || ''} /></div>
      <div className="grid2">
        <div className="field"><label>Status</label><select name="status" defaultValue={r?.status || 'confirmed'}>{RES_STATUSES.map((s) => <option key={s} value={s}>{RES_LABEL[s]}</option>)}</select></div>
        <div className="field"><label>&nbsp;</label><label className="check-inline"><input type="checkbox" name="notify" defaultChecked={!!r} /> Email the guest about this</label></div>
      </div>
      <SubmitButton className="btn sm">{r ? 'Save changes' : 'Add reservation'}</SubmitButton>
    </ActionForm>
  );
}
