'use client';
import { useState } from 'react';
import ActionForm, { SubmitButton } from './ActionForm';
import { submitBuffetFeedback } from '@/app/actions';

const WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

// Star rating plus an optional comment. Goes to the admin dashboard, never published.
export default function BuffetFeedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;
  return (
    <ActionForm action={submitBuffetFeedback} className="form-card bf-form" resetOnSuccess>
      <fieldset className="bf-rate">
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
        <div className="field"><label htmlFor="bf-name">Name (optional)</label><input id="bf-name" name="name" maxLength={80} autoComplete="off" /></div>
        <div className="field"><label htmlFor="bf-email">Email (optional, if you would like a reply)</label><input id="bf-email" name="email" type="email" maxLength={120} autoComplete="off" /></div>
      </div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <SubmitButton className="btn rust" pendingText="Sending...">Send feedback</SubmitButton>
    </ActionForm>
  );
}
