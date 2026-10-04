'use client';
import { useEffect, useState } from 'react';

// Anchor chips that follow the visitor down the menu and highlight the current category.
export default function MenuNav({ cats }) {
  const [active, setActive] = useState(cats[0]?.slug);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.replace('m-', ''))),
      { rootMargin: '-30% 0px -65% 0px' }
    );
    cats.forEach((c) => { const el = document.getElementById(`m-${c.slug}`); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [cats]);
  return (
    <nav className="menu-nav" aria-label="Menu categories">
      <div className="wrap">
        {cats.map((c) => <a key={c.id} href={`#m-${c.slug}`} aria-current={active === c.slug ? 'true' : undefined}>{c.name}</a>)}
      </div>
    </nav>
  );
}
