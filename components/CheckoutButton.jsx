'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import Thumb from './Thumb';
import { money } from '@/lib/format';

const SEEN = 'himalayan-upsell-seen';

// "Checkout" button with a one-time "Complete your meal" step in front of it. The restaurant chooses the
// suggestions in Dashboard > Checkout add-ons. Dishes the guest already has are never suggested, dishes that
// are paired with something in the cart come first, then drinks / desserts / sides from categories the cart lacks.
let cache = null;
async function load() {
  if (cache) return cache;
  try { const r = await fetch('/api/upsell'); cache = r.ok ? await r.json() : { items: [], pairs: {} }; } catch { cache = { items: [], pairs: {} }; }
  return cache;
}

export default function CheckoutButton({ className = 'btn gold block', children = 'Go to checkout', onGo }) {
  const { items: cart, add, subtotal } = useCart();
  const router = useRouter();
  const dlg = useRef(null);
  const [data, setData] = useState(cache);
  const [added, setAdded] = useState([]);

  useEffect(() => { load().then(setData); }, []);

  const picks = useMemo(() => {
    if (!data?.items?.length) return [];
    const inCart = new Set(cart.map((c) => c.itemId));
    const cartCats = new Set(data.items.filter((d) => inCart.has(d.id)).map((d) => d.categoryId));
    const paired = new Set(cart.flatMap((c) => data.pairs?.[c.itemId] || []));
    return data.items
      .filter((d) => !inCart.has(d.id) || added.includes(d.id))
      .map((d) => ({ ...d, score: (paired.has(d.id) ? 100 : 0) + (d.upsell ? 10 : 0) + (cartCats.has(d.categoryId) ? 0 : 5), paired: paired.has(d.id) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [data, cart, added]);

  function go() { dlg.current?.close(); onGo?.(); router.push('/checkout'); }

  function click() {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === '1'; } catch {}
    if (seen || !picks.length) return go();
    try { sessionStorage.setItem(SEEN, '1'); } catch {}
    setAdded([]);
    dlg.current?.showModal();
  }
  function take(p) {
    add({ itemId: p.id, name: p.name, image: p.image, option: p.option, spice: p.spice, addons: [], note: null, price: p.price });
    setAdded((a) => (a.includes(p.id) ? a : [...a, p.id]));
  }

  return (
    <>
      <button type="button" className={className} onClick={click}>{children}</button>
      <dialog ref={dlg} className="mod upsell" onClick={(e) => e.target === dlg.current && dlg.current.close()} aria-label="Complete your meal">
        <div className="mod-body">
          <div className="mod-head"><h3>Complete your meal</h3><button type="button" className="icon-btn" onClick={() => dlg.current.close()} aria-label="Close">&times;</button></div>
          <p className="muted" style={{ marginTop: 0 }}>Our guests love these with their food. Add them with one tap.</p>
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
                  <button type="button" className={`btn sm ${on ? 'gold' : 'line'}`} onClick={() => take(p)} aria-label={`Add ${p.name}`}>{on ? '✓ Added' : '+ Add'}</button>
                </div>
              );
            })}
          </div>
          <div className="up-foot">
            <div className="up-sub"><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <button type="button" className="btn gold block" onClick={go}>Continue to checkout</button>
            <button type="button" className="up-skip" onClick={go}>No thanks</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
