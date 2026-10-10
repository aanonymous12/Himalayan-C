'use client';
import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import OrderSteps from './OrderSteps';
import LineDetails from './LineDetails';
import Thumb from './Thumb';
import { placeOrder, checkPromo } from '@/app/checkout/actions';
import { money, timeLabel } from '@/lib/format';
import { fillSaved, saveDetails, clearSaved } from '@/lib/saved';

const WEEKDAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function centralNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { day: WEEKDAY[parts.weekday], hhmm: `${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}` };
}
function slotsFor(open, close, after) {
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const out = [];
  for (let m = toMin(open); m <= toMin(close) - 15; m += 15) {
    const t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    if (!after || m >= toMin(after) + 15) out.push(t);
  }
  return out;
}

// Guest checkout only: details, pickup time, then an order summary with the promo code and totals.
export default function CheckoutForm({ taxRate, accepting, phoneShown, hours, openTime, closeTime, closedDays }) {
  const { items, setQty, subtotal, ready, blocked } = useCart();
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();
  const [code, setCode] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoMsg, setPromoMsg] = useState(null);
  const [when, setWhen] = useState('asap');
  const [slot, setSlot] = useState('');
  const [clock, setClock] = useState(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => { setClock(centralNow()); }, []);
  // Only details this guest chose to save on our site are filled in. No browser history is suggested.
  useEffect(() => { if (ready && items.length) setRemember(fillSaved({ name: 'name', phone: 'phone', email: 'email' })); }, [ready, items.length > 0]);
  const openNow = clock ? !closedDays.includes(clock.day) && clock.hhmm >= openTime && clock.hhmm < closeTime : true;
  const slots = useMemo(() => {
    if (!clock) return [];
    if (closedDays.includes(clock.day)) return [];
    return slotsFor(openTime, closeTime, clock.hhmm >= openTime ? clock.hhmm : null);
  }, [clock, openTime, closeTime, closedDays]);
  useEffect(() => { if (when === 'later' && !slots.includes(slot)) setSlot(slots[0] || ''); }, [when, slots, slot]);

  const lines = items.map((i) => ({ itemId: i.itemId, option: i.option, spice: i.spice, addons: (i.addons || []).map((a) => a.label), note: i.note, qty: i.qty, name: i.name }));
  const discount = Math.min(promo?.discount || 0, subtotal);
  const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
  const total = subtotal - discount + tax;
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
    const f = new FormData(e.currentTarget);
    setError(null);
    if (when === 'later' && !slot) return setError('Please choose a pickup time.');
    if (remember) saveDetails({ name: f.get('name'), phone: f.get('phone'), email: f.get('email') }); else clearSaved();
    start(async () => {
      const res = await placeOrder({
        name: f.get('name'), phone: f.get('phone'), email: f.get('email'), notes: f.get('notes'),
        pickup: when === 'later' ? `At ${timeLabel(slot)}` : 'ASAP', code: promo?.code || '', items: lines,
      });
      if (res?.error) setError(res.error);
    });
  }

  if (!ready) return <div className="wrap section"><p>Loading your cart...</p></div>;
  if (!items.length) return (
    <div className="wrap section" style={{ textAlign: 'center', maxWidth: 520 }}>
      <h1>Your cart is empty</h1><p style={{ margin: '1rem auto 1.5rem' }}>Add a few dishes from the menu and come back to check out.</p><Link className="btn rust" href="/menu">Browse the menu</Link>
    </div>
  );
  const can = accepting && !blocked;

  return (
    <div className="wrap co">
      <h1 style={{ marginBottom: '.4rem' }}>Checkout</h1>
      <p className="muted" style={{ marginBottom: '1rem' }}>Guest checkout. No account needed, and you pay at the restaurant.</p>
      <OrderSteps current={2} />
      <div className="co-grid">
        <form id="checkout-form" onSubmit={submit}>
          {blocked && <div className="error" role="alert">You cannot place an order as admin.</div>}
          {!accepting && <div className="error" role="alert">Online ordering is paused right now. Please call {phoneShown}.</div>}
          {!openNow && <div className="notice-box" role="status"><b>We are closed right now.</b> Hours: <span className="pre">{hours}</span> You can still order and we will prepare it when we open.</div>}
          {error && <div className="error" role="alert">{error}</div>}

          <section className="co-card">
            <h2><span className="step">1</span>Your details</h2>
            <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="off" /></div>
            <div className="form-grid">
              <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required autoComplete="off" /></div>
              <div className="field"><label htmlFor="email">Email (optional)</label><input id="email" name="email" type="email" autoComplete="off" /></div>
            </div>
            <label className="check-row"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><span>Save my details on this device for next time</span></label>
            <p className="hint" style={{ margin: '.4rem 0 0' }}>We only call or text if there is a problem with your order.</p>
          </section>

          <section className="co-card">
            <h2><span className="step">2</span>Pickup time</h2>
            <div className="radio-cards" role="radiogroup" aria-label="Pickup time">
              <label className="radio-card"><input type="radio" name="when" checked={when === 'asap'} onChange={() => setWhen('asap')} /><span><b>{openNow ? 'As soon as possible' : 'When we open'}</b><small>{openNow ? 'Usually ready in about 20 minutes' : 'First thing after opening'}</small></span></label>
              <label className={`radio-card${slots.length ? '' : ' off'}`}><input type="radio" name="when" disabled={!slots.length} checked={when === 'later'} onChange={() => setWhen('later')} /><span><b>Choose a time</b><small>{slots.length ? 'Pick up later today' : 'No more times today'}</small></span></label>
            </div>
            {when === 'later' && slots.length > 0 && (
              <div className="field" style={{ marginTop: '1rem', marginBottom: 0 }}><label htmlFor="slot">Pickup time today</label>
                <select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)}>{slots.map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}</select></div>
            )}
          </section>

          <section className="co-card">
            <h2><span className="step">3</span>Anything else?</h2>
            <div className="field" style={{ marginBottom: 0 }}><label htmlFor="notes">Notes for the kitchen (optional)</label><textarea id="notes" name="notes" rows={3} maxLength={500} placeholder="Allergies, packing requests..." /></div>
          </section>
        </form>

        <aside className="co-summary" aria-label="Order summary">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: '.25rem' }}>
            <h2>Order summary</h2><Link href="/menu" className="link-btn" style={{ padding: 0 }}>Add more</Link>
          </div>
          <div>
            {items.map((i) => (
              <div className="cart-line" key={i.key}>
                <Thumb src={i.image} name={i.name} />
                <div className="cl-main">
                  <div className="nm">{i.name}</div><LineDetails line={i} />
                  <div className="cl-tools">
                    <div className="stepper">
                      <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label={`One less ${i.name}`}>&minus;</button>
                      <span>{i.qty}</span>
                      <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label={`One more ${i.name}`}>+</button>
                    </div>
                    <button type="button" className="remove" onClick={() => setQty(i.key, 0)}>Remove</button>
                  </div>
                </div>
                <b className="cl-price">{money(i.price * i.qty)}</b>
              </div>
            ))}
          </div>

          <div className="promo">
            <label htmlFor="promo" className="lbl">Promo code</label>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <input id="promo" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" autoComplete="off" maxLength={24} style={{ flex: 1, minWidth: 0 }} />
              <button type="button" className="btn line" onClick={applyPromo} disabled={pending || !code.trim()}>Apply</button>
            </div>
            {promoMsg && <div className={promoMsg.type} style={{ marginTop: '.6rem', marginBottom: 0 }} role="status">{promoMsg.text}</div>}
          </div>

          <div className="totals">
            <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {discount > 0 && <div className="disc"><span>Promo {promo.code}</span><span>&minus;{money(discount)}</span></div>}
            <div><span>Sales tax ({(taxRate * 100).toFixed(2)}%)</span><span>{money(tax)}</span></div>
            <div className="grand"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <button form="checkout-form" className="btn gold block" style={{ marginTop: '1.25rem' }} disabled={pending || !can}>{pending ? 'Placing your order...' : `Place order \u00b7 ${money(total)}`}</button>
          <p className="hint" style={{ textAlign: 'center', marginTop: '.75rem' }}>Pay at the restaurant when you pick up.</p>
        </aside>
      </div>
    </div>
  );
}
