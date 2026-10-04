'use client';
import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import LineDetails from './LineDetails';
import { placeOrder, checkPromo } from '@/app/checkout/actions';
import { money } from '@/lib/format';

// Guest checkout only. No account is needed or offered.
export default function CheckoutForm({ taxRate, accepting, phoneShown }) {
  const { items, setQty, subtotal, ready, blocked } = useCart();
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();
  const [code, setCode] = useState('');
  const [promo, setPromo] = useState(null); // { code, discount, label }
  const [promoMsg, setPromoMsg] = useState(null);

  const lines = items.map((i) => ({ itemId: i.itemId, option: i.option, spice: i.spice, addons: (i.addons || []).map((a) => a.label), note: i.note, qty: i.qty, name: i.name }));
  const discount = Math.min(promo?.discount || 0, subtotal);
  const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
  const total = subtotal - discount + tax;

  // A changed cart can change what a code is worth, so ask the customer to apply it again.
  useEffect(() => { setPromo(null); }, [subtotal]);

  function applyPromo() {
    setPromoMsg(null);
    const phone = document.getElementById('phone')?.value || '';
    start(async () => {
      const r = await checkPromo({ items: lines, code, phone });
      if (r?.ok) { setPromo(r); setPromoMsg({ type: 'ok', text: `${r.code} applied: ${r.label}.` }); }
      else { setPromo(null); setPromoMsg({ type: 'error', text: r?.error || 'Could not check that code.' }); }
    });
  }

  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setError(null);
    start(async () => {
      const res = await placeOrder({
        name: f.get('name'), phone: f.get('phone'), email: f.get('email'), notes: f.get('notes'),
        pickup: f.get('pickup') ? `At ${f.get('pickup')}` : 'ASAP', code: promo?.code || '', items: lines,
      });
      if (res?.error) setError(res.error);
    });
  }

  if (!ready) return <div className="wrap section"><p>Loading your cart...</p></div>;
  if (!items.length) return (
    <div className="wrap section"><h1>Your cart is empty</h1><p style={{ margin: '1rem 0' }}>Add a few things from the menu and come back.</p><Link className="btn rust" href="/menu">Go to the menu</Link></div>
  );

  return (
    <div className="wrap checkout">
      <div>
        <h1 style={{ marginBottom: '1.25rem' }}>Your order</h1>
        <ul className="lines">
          {items.map((i) => (
            <li key={i.key}>
              <div><b>{i.name}</b><LineDetails line={i} />
                <span className="qty" style={{ marginTop: 6 }}>
                  <button type="button" aria-label={`One less ${i.name}`} onClick={() => setQty(i.key, i.qty - 1)}>&minus;</button>
                  {i.qty}
                  <button type="button" aria-label={`One more ${i.name}`} onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                  <button type="button" className="link-btn" onClick={() => setQty(i.key, 0)}>Remove</button>
                </span>
              </div>
              <b>{money(i.price * i.qty)}</b>
            </li>
          ))}
        </ul>

        <div className="promo">
          <label htmlFor="promo" className="lbl">Promo code</label>
          <div className="row">
            <input id="promo" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" autoComplete="off" maxLength={24} style={{ flex: 1, minWidth: 0 }} />
            <button type="button" className="btn line" onClick={applyPromo} disabled={pending || !code.trim()}>Apply</button>
          </div>
          {promoMsg && <div className={promoMsg.type} style={{ marginTop: '.6rem' }} role="status">{promoMsg.text}</div>}
        </div>

        <div className="totals">
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {discount > 0 && <div style={{ color: 'var(--green)' }}><span>Promo {promo.code}</span><span>&minus;{money(discount)}</span></div>}
          <div><span>Sales tax ({(taxRate * 100).toFixed(2)}%)</span><span>{money(tax)}</span></div>
          <div className="grand"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <p className="muted" style={{ marginTop: '1rem' }}>You pay at the restaurant when you pick up.</p>
      </div>

      <form onSubmit={submit}>
        <h2 style={{ marginBottom: '.5rem' }}>Pickup details</h2>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>No account needed. Just tell us who is picking up.</p>
        {blocked && <div className="error" role="alert">You are signed in as an administrator, so ordering is turned off on this device.</div>}
        {error && <div className="error" role="alert">{error}</div>}
        {!accepting && <div className="error">Online ordering is paused. Please call {phoneShown}.</div>}
        <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required autoComplete="tel" /><span className="hint">We call or text only if there is a problem with your order.</span></div>
        <div className="field"><label htmlFor="email">Email (optional, for your receipt)</label><input id="email" name="email" type="email" autoComplete="email" /></div>
        <div className="field"><label htmlFor="pickup">Pickup time (leave empty for as soon as possible)</label><input id="pickup" name="pickup" type="time" /></div>
        <div className="field"><label htmlFor="notes">Notes for the kitchen</label><textarea id="notes" name="notes" rows={3} maxLength={500} /></div>
        <button className="btn gold" disabled={pending || !accepting || blocked}>{pending ? 'Working...' : `Place order \u00b7 ${money(total)}`}</button>
      </form>
    </div>
  );
}
