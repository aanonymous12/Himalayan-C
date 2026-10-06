'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import LineDetails from './LineDetails';
import Thumb from './Thumb';
import { money } from '@/lib/format';

// Slide-over cart. It opens from the cart icon in the header.
export default function CartDrawer() {
  const { items, setQty, subtotal, count, open, setOpen, blocked } = useCart();
  const path = usePathname();
  const closeBtn = useRef(null);

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
      {open && <div className="drawer-ov" onClick={() => setOpen(false)} />}
      <aside className={`drawer${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Your cart" aria-hidden={!open}>
        <div className="drawer-head">
          <h2>Your cart {count > 0 && <span className="muted">({count})</span>}</h2>
          <button ref={closeBtn} className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart" tabIndex={open ? 0 : -1}>&times;</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <p><b>Your cart is empty</b></p>
              <p className="muted">Add a few dishes from the menu to get started.</p>
              <Link href="/menu" className="btn rust" onClick={() => setOpen(false)}>Browse the menu</Link>
            </div>
          ) : items.map((i) => (
            <div className="cart-line" key={i.key}>
              <Thumb src={i.image} name={i.name} />
              <div className="cl-main">
                <div className="nm">{i.name}</div>
                <LineDetails line={i} />
                <div className="cl-tools">
                  <div className="stepper">
                    <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label={`One less ${i.name}`}>&minus;</button>
                    <span aria-live="polite">{i.qty}</span>
                    <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label={`One more ${i.name}`}>+</button>
                  </div>
                  <button type="button" className="remove" onClick={() => setQty(i.key, 0)}>Remove</button>
                </div>
              </div>
              <b className="cl-price">{money(i.price * i.qty)}</b>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="totals"><div className="grand" style={{ border: 0, paddingTop: 0, marginTop: 0 }}><span>Subtotal</span><span>{money(subtotal)}</span></div></div>
            <p className="hint" style={{ margin: '.3rem 0 1rem' }}>Tax and promo codes are applied at checkout. You pay at the restaurant.</p>
            {blocked
              ? <p className="error">You cannot place an order as admin.</p>
              : <Link href="/checkout" className="btn gold block" onClick={() => setOpen(false)}>Go to checkout</Link>}
            <button className="btn line block" style={{ marginTop: '.6rem' }} onClick={() => setOpen(false)}>Continue shopping</button>
          </div>
        )}
      </aside>
    </>
  );
}
