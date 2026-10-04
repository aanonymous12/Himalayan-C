import Link from 'next/link';
import AutoRefresh from '@/components/AutoRefresh';
import ReservationEditor from '@/components/admin/ReservationForm';
import { requireAdmin } from '@/lib/auth';
import { setReservationStatus } from '../actions';
import { dateLong, timeLabel, telHref, todayISO, RES_STATUSES, RES_LABEL } from '@/lib/format';

const NEXT = { pending: [['confirmed', 'Confirm'], ['declined', 'Decline']], confirmed: [['completed', 'Mark completed'], ['cancelled', 'Cancel']] };
const CHIP = { pending: 'new', confirmed: 'ready', completed: '', declined: 'cancelled', cancelled: 'cancelled' };

export default async function AdminReservations({ searchParams }) {
  const { sb } = await requireAdmin();
  const { status } = await searchParams;
  let q = sb.from('reservations').select('*').order('res_date').order('res_time').limit(300);
  if (status === 'all') { /* everything */ }
  else if (RES_STATUSES.includes(status)) q = q.eq('status', status);
  else q = q.in('status', ['pending', 'confirmed']).gte('res_date', todayISO());
  const { data } = await q;
  const list = data ?? [];

  return (
    <>
      <AutoRefresh seconds={30} />
      <div className="page-head"><div><h1>Reservations</h1><p className="muted">Confirm requests, move them to another date or time, or add phone bookings.</p></div></div>
      <details className="edit"><summary><b>+ Add a reservation</b></summary><ReservationEditor /></details>
      <div className="row" style={{ margin: '1.25rem 0' }}>
        <Link className="chip" aria-pressed={!status} href="/admin/reservations">Upcoming</Link>
        {RES_STATUSES.map((s) => <Link key={s} className="chip" aria-pressed={status === s} href={`/admin/reservations?status=${s}`}>{RES_LABEL[s]}</Link>)}
        <Link className="chip" aria-pressed={status === 'all'} href="/admin/reservations?status=all">All</Link>
      </div>
      {!list.length && <p className="muted">No reservations here.</p>}
      {list.map((r) => (
        <div className="order" key={r.id}>
          <div className="order-top">
            <b>#{r.ref} &nbsp;{r.name} <span className="badge">{r.kind === 'event' ? 'Event' : 'Table'}</span></b>
            <span className={`status ${CHIP[r.status]}`}>{RES_LABEL[r.status]}</span>
          </div>
          <div><b>{dateLong(r.res_date)} at {timeLabel(String(r.res_time).slice(0, 5))}</b> &nbsp; {r.party_size} {r.party_size === 1 ? 'guest' : 'guests'}{r.event_type ? ` (${r.event_type})` : ''}</div>
          <div className="muted"><a href={telHref(r.phone)}>{r.phone}</a>{r.email && <> &nbsp; <a href={`mailto:${r.email}`}>{r.email}</a></>}</div>
          {r.notes && <p className="note" style={{ marginTop: '.5rem' }}>Note: {r.notes}</p>}
          <div className="row" style={{ margin: '.75rem 0 .25rem' }}>
            {(NEXT[r.status] || []).map(([to, label]) => (
              <form action={setReservationStatus} key={to}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={to} />
                <button className={`btn sm ${to === 'confirmed' || to === 'completed' ? '' : 'line'}`}>{label}</button></form>
            ))}
          </div>
          <details className="edit"><summary>Edit or reschedule</summary><ReservationEditor r={r} /></details>
        </div>
      ))}
    </>
  );
}
