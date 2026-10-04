'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import { money } from '@/lib/format';
import LineDetails from './LineDetails';

// Slide-over cart plus a floating "View order" bar, like the big ordering sites.
export default function CartDrawer() {
  const { items, setQty, subtotal, count, open, setOpen, ready, blocked } = useCart();
  const path = usePathname();
  const closeBtn = useRef(null);
  const onCheckout = path === '/checkout' || path.startsWith('/order/');

  useEffect(() => { setOpen(false); }, [path, setOpen]);
  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, setOpen]);

  return (
    <>
      {ready && count > 0 && !open && !onCheckout && (
        <button className="cartbar" onClick={() => setOpen(true)}>
          <span>View order <b>({count})</b></span><span>{money(subtotal)}</span>
        </button>
      )}
      {open && <div className="drawer-ov" onClick={() => setOpen(false)} />}
      <aside className={`drawer${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Your order" aria-hidden={!open}>
        <div className="drawer-head">
          <h2>Your order</h2>
          <button ref={closeBtn} className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart" tabIndex={open ? 0 : -1}>&times;</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty"><p><b>Your cart is empty</b></p><p className="muted">Add a few dishes from the menu to get started.</p>
              <Link href="/menu" className="btn rust" onClick={() => setOpen(false)}>Browse the menu</Link></div>
          ) : items.map((i) => (
            <div className="cart-line" key={i.key}>
              <div><b>{i.name}</b><LineDetails line={i} />
                <div className="qty" style={{ marginTop: '.5rem' }}>
                  <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label={`One less ${i.name}`}>&minus;</button>
                  <span aria-live="polite">{i.qty}</span>
                  <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label={`One more ${i.name}`}>+</button>
                  <button type="button" className="link-btn" onClick={() => setQty(i.key, 0)}>Remove</button>
                </div>
              </div>
              <b>{money(i.price * i.qty)}</b>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="totals"><div><span>Subtotal</span><b>{money(subtotal)}</b></div></div>
            <p className="hint" style={{ margin: '.4rem 0 1rem' }}>Tax is added at checkout. You pay at the restaurant.</p>
            {blocked ? <p className="error">Administrator accounts cannot place orders.</p> : <Link href="/checkout" className="btn gold" style={{ width: '100%' }} onClick={() => setOpen(false)}>Checkout</Link>}
            <button className="btn line" style={{ width: '100%', marginTop: '.6rem' }} onClick={() => setOpen(false)}>Continue ordering</button>
          </div>
        )}
      </aside>
    </>
  );
}
