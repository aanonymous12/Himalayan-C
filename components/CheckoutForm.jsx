'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { placeOrder } from '@/app/checkout/actions';
import { money } from '@/lib/format';

export default function CheckoutForm({ user, profile, taxRate, accepting, phoneShown }) {
  const { items, setQty, subtotal, ready } = useCart();
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();
  const tax = Math.round(subtotal * taxRate * 100) / 100;

  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setError(null);
    start(async () => {
      const res = await placeOrder({
        name: f.get('name'), phone: f.get('phone'), email: f.get('email'), notes: f.get('notes'),
        pickup: f.get('pickup') ? `At ${f.get('pickup')}` : 'ASAP',
        items: items.map((i) => ({ itemId: i.itemId, option: i.option, qty: i.qty, name: i.name })),
      });
      if (res?.error) setError(res.error);
    });
  }

  if (!ready) return <div className="wrap section"><p>Loading your cart...</p></div>;
  if (!items.length) return (
    <div className="wrap section"><h1>Your cart is empty</h1><p style={{ margin: '1rem 0' }}>Add a few things from the menu and come back.</p><Link className="btn" href="/menu">Go to the menu</Link></div>
  );

  return (
    <div className="wrap checkout">
      <div>
        <h1 style={{ marginBottom: '1.25rem' }}>Your order</h1>
        <ul className="lines">
          {items.map((i) => (
            <li key={i.key}>
              <div><b>{i.name}</b>{i.option && <div className="muted">{i.option}</div>}
                <span className="qty" style={{ marginTop: 6 }}>
                  <button type="button" aria-label={`One less ${i.name}`} onClick={() => setQty(i.key, i.qty - 1)}>-</button>
                  {i.qty}
                  <button type="button" aria-label={`One more ${i.name}`} onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                </span>
              </div>
              <b>{money(i.price * i.qty)}</b>
            </li>
          ))}
        </ul>
        <div className="totals">
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div><span>Sales tax ({(taxRate * 100).toFixed(2)}%)</span><span>{money(tax)}</span></div>
          <div className="grand"><span>Total</span><span>{money(subtotal + tax)}</span></div>
        </div>
        <p className="muted" style={{ marginTop: '1rem' }}>You pay at the restaurant when you pick up.</p>
      </div>

      <form onSubmit={submit}>
        <h2 style={{ marginBottom: '1rem' }}>Pickup details</h2>
        {user ? (
          <p className="ok">Ordering as {user.email}. This order will show up in your account.</p>
        ) : (
          <div className="choice">
            <div className="on"><b>Guest checkout</b><br />No account needed. Just fill in the form.</div>
            <Link href="/login?next=/checkout"><b>Log in or sign up</b><br />Save your details and see past orders.</Link>
          </div>
        )}
        {error && <div className="error" role="alert">{error}</div>}
        {!accepting && <div className="error">Online ordering is paused. Please call {phoneShown}.</div>}
        <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required defaultValue={profile?.full_name || ''} autoComplete="name" /></div>
        <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required defaultValue={profile?.phone || ''} autoComplete="tel" /><span className="hint">We call or text only if there is a problem with your order.</span></div>
        <div className="field"><label htmlFor="email">Email (optional)</label><input id="email" name="email" type="email" defaultValue={user?.email || ''} autoComplete="email" /></div>
        <div className="field"><label htmlFor="pickup">Pickup time (leave empty for as soon as possible)</label><input id="pickup" name="pickup" type="time" min="12:00" max="21:00" /></div>
        <div className="field"><label htmlFor="notes">Notes, spice level, allergies</label><textarea id="notes" name="notes" rows={3} maxLength={500} /></div>
        <button className="btn gold" disabled={pending || !accepting}>{pending ? 'Placing order...' : `Place order, ${money(subtotal + tax)}`}</button>
      </form>
    </div>
  );
}
