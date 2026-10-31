'use client';
import { useEffect, useState } from 'react';
import { fillSaved } from '@/lib/saved';
import ActionForm, { SubmitButton } from './ActionForm';
import { submitReservation } from '@/app/actions';
import { timeLabel } from '@/lib/format';

const EVENT_TYPES = ['Birthday', 'Anniversary', 'Family gathering', 'Corporate event', 'Other'];

export default function ReservationForm({ slots, minDate, maxDate, defaults }) {
  const [kind, setKind] = useState('table');
  useEffect(() => { fillSaved({ name: 'r-name', phone: 'r-phone', email: 'r-email' }); }, []);
  return (
    <ActionForm action={submitReservation} className="form-card" resetOnSuccess>
      <div className="seg" role="radiogroup" aria-label="Reservation type">
        <label><input type="radio" name="kind" value="table" checked={kind === 'table'} onChange={() => setKind('table')} />Table</label>
        <label><input type="radio" name="kind" value="event" checked={kind === 'event'} onChange={() => setKind('event')} />Event</label>
      </div>
      <p className="req-note"><b>*</b> Required</p>
      <div className="form-grid">
        <div className="field"><label htmlFor="r-date">Date</label><input id="r-date" name="date" type="date" required min={minDate} max={maxDate} placeholder="Choose a date" /></div>
        <div className="field"><label htmlFor="r-time">Time</label>
          <select id="r-time" name="time" required defaultValue=""><option value="" disabled>Choose a time</option>{slots.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</select></div>
        <div className="field"><label htmlFor="r-size">Guests</label>
          {kind === 'table'
            ? <select id="r-size" name="party_size" required defaultValue=""><option value="" disabled>Guests</option>{Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}</select>
            : <input id="r-size" name="party_size" type="number" inputMode="numeric" min="10" max="300" required placeholder="How many guests? (10 or more)" />}
        </div>
        {kind === 'event'
          ? <div className="field"><label htmlFor="r-type">Type of event</label><select id="r-type" name="event_type" required defaultValue=""><option value="" disabled>Choose type of event</option>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          : <div />}
        <div className="field"><label htmlFor="r-name">Name</label><input id="r-name" name="name" required autoComplete="off" placeholder="Your full name" defaultValue={defaults?.name || ''} /></div>
        <div className="field"><label htmlFor="r-phone">Phone</label><input id="r-phone" name="phone" type="tel" required autoComplete="off" placeholder="(512) 555-0123" defaultValue={defaults?.phone || ''} /></div>
        <div className="field full"><label htmlFor="r-email">Email (for your confirmation)</label><input id="r-email" name="email" type="email" autoComplete="off" placeholder="you@example.com" defaultValue={defaults?.email || ''} /></div>
        <div className="field full"><label htmlFor="r-notes">Anything we should know? (allergies, high chair, occasion)</label><textarea id="r-notes" name="notes" rows={3} maxLength={500} placeholder="Allergies, high chair, birthday surprise..." /></div>
      </div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <SubmitButton className="btn rust" pendingText="Sending request...">Request reservation</SubmitButton>
      <p className="hint" style={{ marginTop: '.75rem' }}>We confirm every reservation by phone or email. Your table is not held until you hear from us.</p>
    </ActionForm>
  );
}
