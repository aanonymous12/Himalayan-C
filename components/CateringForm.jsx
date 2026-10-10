'use client';
import { useEffect } from 'react';
import { fillSaved } from '@/lib/saved';
import ActionForm, { SubmitButton } from './ActionForm';
import { submitCatering } from '@/app/actions';

export default function CateringForm({ minDate }) {
  useEffect(() => { fillSaved({ name: 'c-name', phone: 'c-phone', email: 'c-email' }); }, []);
  return (
    <ActionForm action={submitCatering} className="form-card" resetOnSuccess>
      <div className="form-grid">
        <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" name="name" required autoComplete="off" /></div>
        <div className="field"><label htmlFor="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" required autoComplete="off" /></div>
        <div className="field full"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" autoComplete="off" /></div>
        <div className="field"><label htmlFor="c-date">Event date</label><input id="c-date" name="event_date" type="date" required min={minDate} /></div>
        <div className="field"><label htmlFor="c-guests">Number of guests</label><input id="c-guests" name="guests" type="number" min="5" max="1000" defaultValue="25" required /></div>
        <div className="field full"><label htmlFor="c-msg">Details (type of event, dishes, dietary needs)</label><textarea id="c-msg" name="message" rows={4} required maxLength={2000} /></div>
      </div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <SubmitButton className="btn rust" pendingText="Sending...">Request a catering quote</SubmitButton>
      <p className="hint" style={{ marginTop: '.75rem' }}>We call you within one business day with a menu and a quote.</p>
    </ActionForm>
  );
}
