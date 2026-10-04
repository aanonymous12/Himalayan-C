import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="section"><div className="wrap" style={{ textAlign: 'center', maxWidth: 560 }}>
      <h1>We could not find that page</h1>
      <p style={{ margin: '1rem auto 2rem' }}>It may have moved. Try the menu, or head back to the home page.</p>
      <div className="btn-row" style={{ justifyContent: 'center' }}><Link href="/" className="btn rust">Home</Link><Link href="/menu" className="btn line">Menu</Link></div>
    </div></section>
  );
}
