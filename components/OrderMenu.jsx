'use client';
import { useState } from 'react';
import DishCard from './DishCard';
import CartPanel from './CartPanel';

// Standard ordering layout: category pills and dish cards on the left, a sticky cart on the right.
export default function OrderMenu({ cats, items, canOrder }) {
  const [cat, setCat] = useState('all');
  const shown = cats.filter((c) => cat === 'all' || c.slug === cat);
  return (
    <div className="wrap order-layout">
      <div className="order-main">
        <div className="cat-pills" role="group" aria-label="Menu categories">
          <button type="button" className="chip" aria-pressed={cat === 'all'} onClick={() => setCat('all')}>All</button>
          {cats.map((c) => <button type="button" key={c.id} className="chip" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)}>{c.name}</button>)}
        </div>
        {shown.map((c) => (
          <section key={c.id} id={`m-${c.slug}`} className="cat">
            <h2>{c.name}</h2>
            {c.description && <p>{c.description}</p>}
            <div className="dish-grid">
              {items.filter((i) => i.category_id === c.id).map((i) => <DishCard key={i.id} item={i} slug={c.slug} canOrder={canOrder} />)}
            </div>
          </section>
        ))}
      </div>
      <CartPanel />
    </div>
  );
}
