'use client';
import { useState } from 'react';
import Link from 'next/link';
import ActionForm, { SubmitButton } from './ActionForm';
import { submitFeedback } from '@/app/actions';
import Icon from './Icon';

// The NFC / QR page: happy guests go to Google, others tell us privately.
export default function ReviewChooser({ googleUrl }) {
  const [step, setStep] = useState(null);
  if (step === 'love') return (
    <div className="form-card" style={{ textAlign: 'center' }}>
      <div className="stars" style={{ fontSize: '1.6rem' }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
      <h2 style={{ margin: '.5rem 0' }}>We are so glad.</h2>
      <p style={{ marginInline: 'auto' }}>A short Google review helps other people in San Marcos find us. It takes under a minute.</p>
      <div className="btn-row" style={{ justifyContent: 'center' }}>
        {googleUrl ? <a className="btn rust" href={googleUrl} target="_blank" rel="noopener noreferrer">Write a Google review</a> : <Link className="btn rust" href="/">Back to the site</Link>}
        <button className="btn line" onClick={() => setStep(null)}>Back</button>
      </div>
    </div>
  );
  if (step === 'meh') return (
    <div className="form-card">
      <h2 style={{ marginBottom: '.5rem' }}>Tell us what went wrong.</h2>
      <p className="muted">This goes straight to the owners, not online. We read every message.</p>
      <ActionForm action={submitFeedback} resetOnSuccess>
        <div className="field"><label htmlFor="f-msg">What could we do better?</label><textarea id="f-msg" name="message" rows={5} required maxLength={1500} /></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="f-name">Name (optional)</label><input id="f-name" name="name" /></div>
          <div className="field"><label htmlFor="f-email">Email (optional, if you would like a reply)</label><input id="f-email" name="email" type="email" /></div>
        </div>
        <input type="hidden" name="rating" value="2" />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div className="btn-row"><SubmitButton className="btn rust" pendingText="Sending...">Send feedback</SubmitButton><button type="button" className="btn line" onClick={() => setStep(null)}>Back</button></div>
      </ActionForm>
    </div>
  );
  return (
    <div className="big-choice">
      <button onClick={() => setStep('love')}><Icon name="heart" size={34} />I loved it<span>Share it with a Google review</span></button>
      <button onClick={() => setStep('meh')}><Icon name="door" size={34} />It could be better<span>Tell us privately so we can fix it</span></button>
    </div>
  );
}
