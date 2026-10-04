'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { money } from '@/lib/format';

export default function AddToCart({ item }) {
  const { add } = useCart();
  const opts = item.options || [];
  const [pick, setPick] = useState(0);
  const [done, setDone] = useState(false);

  function go() {
    const o = opts[pick];
    add({ itemId: item.id, name: item.name, option: o?.label || null, price: Number(o ? o.price : item.price) });
    setDone(true);
    setTimeout(() => setDone(false), 1200);
  }

  return (
    <>
      {opts.length > 0 ? (
        <select value={pick} onChange={(e) => setPick(Number(e.target.value))} aria-label={`Choose option for ${item.name}`}>
          {opts.map((o, i) => <option key={o.label} value={i}>{o.label} - {money(o.price)}</option>)}
        </select>
      ) : (
        <span className="price">{money(item.price)}</span>
      )}
      <button className="btn sm rust" onClick={go}>{done ? 'Added' : 'Add'}</button>
    </>
  );
}
