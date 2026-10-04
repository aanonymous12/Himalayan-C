'use client';
import { useEffect } from 'react';

export default function AdminError({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="order">
      <h2 style={{ fontSize: '1.3rem' }}>Something went wrong</h2>
      <p className="muted">This page could not load. {error?.digest ? `Reference: ${error.digest}.` : ''} Check the Vercel logs for that reference if it keeps happening.</p>
      <button className="btn sm" onClick={reset}>Try again</button>
    </div>
  );
}
