'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import LineDetails from './LineDetails';
import { money } from '@/lib/format';

// Sticky "Your cart" panel beside the menu on larger screens (phones use the cart icon in the header).
export default function CartPanel() {
  const { items, setQty, subtotal, count, ready, blocked } = useCart();
  return (
    <aside className="cart-panel" aria-label="Your cart">
      <h2>Your cart{ready && count > 0 && <span className="muted"> ({count})</span>}</h2>
      {!ready || items.length === 0 ? (
        <p className="muted cp-empty">Your cart is empty. Add a dish to get started.</p>
      ) : (
        <>
          <div className="cp-lines">
            {items.map((i) => (
              <div className="cp-line" key={i.key}>
                <div className="cp-top">
                  <div style={{ minWidth: 0 }}><div className="nm">{i.name}</div><LineDetails line={i} /></div>
                  <button type="button" className="cp-x" onClick={() => setQty(i.key, 0)} aria-label={`Remove ${i.name}`}>&times;</button>
                </div>
                <div className="cp-bot">
                  <div className="stepper">
                    <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label={`One less ${i.name}`}>&minus;</button>
                    <span aria-live="polite">{i.qty}</span>
                    <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label={`One more ${i.name}`}>+</button>
                  </div>
                  <b>{money(i.price * i.qty)}</b>
                </div>
              </div>
            ))}
          </div>
          <div className="cp-sub"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <p className="hint" style={{ margin: '.25rem 0 1rem' }}>Tax and promo codes are added at checkout.</p>
          {blocked
            ? <p className="error" role="alert" style={{ margin: 0 }}>You cannot place an order as admin.</p>
            : <Link href="/checkout" className="btn gold block">Checkout &rarr;</Link>}
        </>
      )}
    </aside>
  );
}
