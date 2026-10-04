'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
const KEY = 'himalayan-cart-v2';

// blocked = an administrator is signed in on this browser, so ordering is switched off.
export function CartProvider({ children, blocked = false }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const add = useCallback((line) =>
    setItems((cur) => {
      const key = [line.itemId, line.option, line.spice, (line.addons || []).map((a) => a.label).sort().join(','), line.note].join('|');
      return cur.some((i) => i.key === key)
        ? cur.map((i) => (i.key === key ? { ...i, qty: Math.min(50, i.qty + 1) } : i))
        : [...cur, { ...line, key, qty: 1 }];
    }), []);
  const setQty = useCallback((key, qty) =>
    setItems((cur) => (qty <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty: Math.min(50, qty) } : i)))), []);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);

  return <Ctx.Provider value={{ items, add, setQty, clear, count, subtotal, ready, open, setOpen, blocked }}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
