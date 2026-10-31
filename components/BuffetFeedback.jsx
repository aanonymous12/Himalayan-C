'use client';
import { useState } from 'react';
import Link from 'next/link';
import ActionForm, { SubmitButton } from './ActionForm';
import { submitBuffetFeedback } from '@/app/actions';

const WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

// Star rating plus an optional comment. Goes to the admin dashboard, never published.
export default function BuffetFeedback({ googleUrl }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [done, setDone] = useState(0); // the star rating that was sent
  const shown = hover || rating;
  if (done) return (
    <div className="form-card" style={{ textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 .5rem' }}>Thank you.</h2>
      {done === 5
        ? <><p style={{ marginInline: 'auto' }}>We are so glad you enjoyed it. A short Google review helps other people in San Marcos find us.</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>{googleUrl ? <a className="btn rust" href={googleUrl} target="_blank" rel="noopener noreferrer">Write a Google review</a> : <Link className="btn rust" href="/">Back to the site</Link>}</div></>
        : <p style={{ marginInline: 'auto' }}>Your review will go to the kitchen. We read every one and we will work on it.</p>}
    </div>
  );
  return (
    <ActionForm action={async (a, fd) => { const r = await submitBuffetFeedback(a, fd); if (r?.ok) setDone(Number(fd.get('rating')) || 1); return r; }} className="form-card bf-form" resetOnSuccess>
      <fieldset className="bf-rate req">
        <legend>How was today&apos;s buffet?</legend>
        <div className="bf-stars" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={n <= shown ? 'on' : ''} onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} required />
              <span aria-hidden="true">&#9733;</span><span className="sr">{n} {n === 1 ? 'star' : 'stars'}, {WORDS[n]}</span>
            </label>
          ))}
          <b className="bf-word" aria-live="polite">{WORDS[shown]}</b>
        </div>
      </fieldset>
      <div className="field"><label htmlFor="bf-msg">Tell us more (optional)</label><textarea id="bf-msg" name="message" rows={4} maxLength={1500} placeholder="What did you enjoy? What could be better?" /></div>
      <div className="form-grid">
        <div className="field"><label htmlFor="bf-name">Name (optional)</label><input id="bf-name" name="name" maxLength={80} autoComplete="off" placeholder="Your name" /></div>
        <div className="field"><label htmlFor="bf-email">Email (optional, if you would like a reply)</label><input id="bf-email" name="email" type="email" maxLength={120} autoComplete="off" placeholder="you@example.com" /></div>
      </div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <SubmitButton className="btn rust" pendingText="Sending...">Send feedback</SubmitButton>
    </ActionForm>
  );
}
