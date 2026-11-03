import Link from 'next/link';

// "1. Browse Menu > 2. Add-ons > 3. Checkout & Pay" progress pills shown on the menu, add-ons and checkout pages.
const STEPS = [['Browse Menu', '/menu'], ['Add-ons', '/add-ons'], ['Checkout & Pay', '/checkout']];

export default function OrderSteps({ current = 1 }) {
  return (
    <ol className="steps-pills" aria-label="Order progress">
      {STEPS.map(([label, href], i) => {
        const n = i + 1, text = `${n}. ${label}`;
        return (
          <li key={label} className={current === n ? 'on' : current > n ? 'done' : ''} aria-current={current === n ? 'step' : undefined}>
            {current > n ? <Link href={href}>{text}</Link> : <span>{text}</span>}
          </li>
        );
      })}
    </ol>
  );
}
