'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
const KEY = 'himalayan-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const add = (line) =>
    setItems((cur) => {
      const key = `${line.itemId}|${line.option || ''}`;
      return cur.some((i) => i.key === key)
        ? cur.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
        : [...cur, { ...line, key, qty: 1 }];
    });
  const setQty = (key, qty) =>
    setItems((cur) => (qty <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty } : i))));
  const clear = () => setItems([]);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);

  return <Ctx.Provider value={{ items, add, setQty, clear, count, subtotal, ready }}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
