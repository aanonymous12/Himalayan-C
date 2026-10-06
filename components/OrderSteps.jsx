import Link from 'next/link';

// "1. Browse Menu  >  2. Checkout & Pay" progress pills shown on the menu and checkout pages.
export default function OrderSteps({ current = 1 }) {
  return (
    <ol className="steps-pills" aria-label="Order progress">
      <li className={current === 1 ? 'on' : 'done'} aria-current={current === 1 ? 'step' : undefined}>
        {current === 2 ? <Link href="/menu">1. Browse Menu</Link> : <span>1. Browse Menu</span>}
      </li>
      <li className={current === 2 ? 'on' : ''} aria-current={current === 2 ? 'step' : undefined}><span>2. Checkout &amp; Pay</span></li>
    </ol>
  );
}
