'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="section"><div className="wrap" style={{ textAlign: 'center', maxWidth: 560 }}>
      <h1>Something went wrong</h1>
      <p style={{ margin: '1rem auto 2rem' }}>Please try again. If it keeps happening, call us and we will help.{error?.digest ? ` (Reference ${error.digest})` : ''}</p>
      <div className="btn-row" style={{ justifyContent: 'center' }}><button className="btn rust" onClick={reset}>Try again</button><Link href="/" className="btn line">Home</Link></div>
    </div></section>
  );
}
