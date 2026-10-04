import Link from 'next/link';

export default function HoursCard({ s }) {
  return (
    <div className="card">
      <h3>Opening hours</h3><p className="pre" style={{ marginTop: '.5rem' }}>{s.hours}</p>
      <h3 style={{ marginTop: '1.25rem' }}>Find us</h3><p className="pre" style={{ marginTop: '.5rem' }}>{s.address}</p>
      <Link href="/contact" className="btn rust sm">Directions and contact</Link>
    </div>
  );
}
