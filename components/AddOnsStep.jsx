'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import OrderSteps from './OrderSteps';
import Thumb from './Thumb';
import { money } from '@/lib/format';

// The add-ons step of every order. The restaurant picks the dishes (Dashboard > Checkout add-ons).
// Anything already in the cart is never offered, dishes paired with something in the cart come first, and
// when there is nothing left to offer the guest simply continues to checkout.
export default function AddOnsStep({ items, pairs }) {
  const { items: cart, add, setQty, subtotal, count, ready, blocked } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState([]); // add-ons taken on this page stay visible so they can be undone

  const picks = useMemo(() => {
    const inCart = new Set(cart.map((c) => c.itemId));
    const cartCats = new Set(items.filter((d) => inCart.has(d.id)).map((d) => d.categoryId));
    const paired = new Set(cart.flatMap((c) => pairs?.[c.itemId] || []));
    return items
      .filter((d) => !inCart.has(d.id) || added.includes(d.id))
      .map((d) => ({ ...d, paired: paired.has(d.id), score: (paired.has(d.id) ? 100 : 0) + (d.upsell ? 10 : 0) + (cartCats.has(d.categoryId) ? 0 : 5) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [items, pairs, cart, added]);

  const empty = ready && cart.length === 0;
  const nothing = ready && !blocked && cart.length > 0 && picks.length === 0;
  useEffect(() => { if (nothing) router.replace('/checkout'); }, [nothing, router]);

  const take = (p) => {
    add({ itemId: p.id, name: p.name, image: p.image, option: p.option, spice: p.spice, addons: [], note: null, price: p.price });
    setAdded((a) => (a.includes(p.id) ? a : [...a, p.id]));
  };
  const drop = (p) => { const line = cart.find((c) => c.itemId === p.id); if (line) setQty(line.key, 0); setAdded((a) => a.filter((x) => x !== p.id)); };

  if (!ready || nothing) return <div className="wrap section"><p>Loading your order...</p></div>;
  if (empty) return (
    <div className="wrap section" style={{ maxWidth: 560, textAlign: 'center' }}>
      <h1>Your cart is empty</h1>
      <p className="muted">Add a few dishes first, then come back here.</p>
      <Link href="/menu" className="btn rust">Browse the menu</Link>
    </div>
  );
  if (blocked) return <div className="wrap section" style={{ maxWidth: 560 }}><p className="error">You cannot place an order as admin.</p></div>;

  return (
    <div className="wrap section addons">
      <OrderSteps current={2} />
      <h1>Complete your meal</h1>
      <p className="muted" style={{ marginTop: '.4rem' }}>Our guests love these with their food. Add them with one tap, or skip to checkout.</p>

      <div className="addons-layout">
        <div className="up-grid">
          {picks.map((p) => {
            const on = added.includes(p.id);
            return (
              <div className={`up-card${on ? ' on' : ''}`} key={p.id}>
                <Thumb src={p.image} name={p.name} />
                <div className="up-main">
                  <b>{p.name}{p.veg && <span className="veg" title="Vegetarian" />}</b>
                  {p.paired && <span className="up-tag">Goes well with your order</span>}
                  <span className="muted">{p.option ? `${p.option} · ` : ''}{money(p.price)}</span>
                </div>
                <button type="button" className={`btn sm ${on ? 'gold' : 'line'}`} onClick={() => (on ? drop(p) : take(p))} aria-pressed={on} aria-label={`${on ? 'Remove' : 'Add'} ${p.name}`}>{on ? '✓ Added' : '+ Add'}</button>
              </div>
            );
          })}
        </div>

        <aside className="addons-sum" aria-label="Your order so far">
          <h2>Your order ({count})</h2>
          <ul>
            {cart.map((c) => <li key={c.key}><span>{c.qty} &times; {c.name}</span><b>{money(c.qty * c.price)}</b></li>)}
          </ul>
          <div className="up-sub"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <p className="hint">Tax and promo codes are added at checkout. You pay at the restaurant.</p>
          <Link href="/checkout" className="btn gold block">Continue to checkout</Link>
          <Link href="/menu" className="up-skip" style={{ textAlign: 'center' }}>Back to the menu</Link>
        </aside>
      </div>
    </div>
  );
}
