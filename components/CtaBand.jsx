import Link from 'next/link';

export default function CtaBand({ title = 'Hungry? Order online for pickup.', text = 'Pay at the restaurant when you collect.', href = '/menu', label = 'Order online' }) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <div><h2>{title}</h2><p>{text}</p></div>
        <Link href={href} className="btn gold">{label}</Link>
      </div>
    </section>
  );
}
