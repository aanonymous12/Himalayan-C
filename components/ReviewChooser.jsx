'use client';
import { useState } from 'react';
import Link from 'next/link';
import ActionForm, { SubmitButton } from './ActionForm';
import { submitFeedback } from '@/app/actions';

const WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

// The NFC / QR page. Guests rate their visit with stars.
// 5 stars: invited to leave a Google review (link set in Dashboard > Settings).
// 1 to 4 stars: thanked, and their note goes privately to the kitchen, never online.
export default function ReviewChooser({ googleUrl }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sent, setSent] = useState(false);
  const shown = hover || rating;

  if (sent) return (
    <div className="form-card" style={{ textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 .5rem' }}>Thank you.</h2>
      <p style={{ marginInline: 'auto' }}>Your review will go to the kitchen. We read every one and we will work on it.</p>
      <div className="btn-row" style={{ justifyContent: 'center' }}><Link className="btn line" href="/">Back to the site</Link></div>
    </div>
  );

  return (
    <div className="form-card">
      <fieldset className="bf-rate req" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>Tap a star to rate your visit</legend>
        <div className="bf-stars" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Your rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={n <= shown ? 'on' : ''} onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rate" value={n} checked={rating === n} onChange={() => setRating(n)} />
              <span aria-hidden="true">&#9733;</span><span className="sr">{n} {n === 1 ? 'star' : 'stars'}, {WORDS[n]}</span>
            </label>
          ))}
          <b className="bf-word" aria-live="polite">{WORDS[shown]}</b>
        </div>
      </fieldset>

      {rating === 5 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <h2 style={{ margin: '.25rem 0' }}>We are so glad.</h2>
          <p style={{ marginInline: 'auto' }}>A short Google review helps other people in San Marcos find us. It takes under a minute.</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            {googleUrl ? <a className="btn rust" href={googleUrl} target="_blank" rel="noopener noreferrer">Write a Google review</a> : <Link className="btn rust" href="/">Back to the site</Link>}
          </div>
        </div>
      )}

      {rating >= 1 && rating <= 4 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ margin: '0 0 .35rem' }}>Thank you for telling us.</h2>
          <p className="muted" style={{ marginTop: 0 }}>Your review goes to the kitchen, not online. We read every message.</p>
          <FeedbackForm rating={rating} onSent={() => setSent(true)} />
        </div>
      )}
    </div>
  );
}

function FeedbackForm({ rating, onSent }) {
  return (
    <ActionForm action={async (a, fd) => { const r = await submitFeedback(a, fd); if (r?.ok) onSent(); return r; }}>
      <div className="field"><label htmlFor="f-msg">What could we do better?</label><textarea id="f-msg" name="message" rows={5} required maxLength={1500} placeholder="Tell us what happened, so we can fix it" /></div>
      <div className="form-grid">
        <div className="field"><label htmlFor="f-name">Name (optional)</label><input id="f-name" name="name" placeholder="Your name" autoComplete="off" /></div>
        <div className="field"><label htmlFor="f-email">Email (optional, if you would like a reply)</label><input id="f-email" name="email" type="email" placeholder="you@example.com" autoComplete="off" /></div>
      </div>
      <input type="hidden" name="rating" value={rating} />
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="btn-row"><SubmitButton className="btn rust" pendingText="Sending...">Send to the kitchen</SubmitButton></div>
    </ActionForm>
  );
}
