'use client';
import { useEffect, useMemo, useRef } from 'react';
import { frame, layout } from '@/lib/scene';

// Home page hero. With food images it becomes a short "scroll scene": the hero stays pinned while the
// dishes slide across in 3D from right to left. Without images it is the plain hero.
export default function HeroScene({ items = [], shape = 'cutout', bg, children }) {
  const root = useRef(null);
  const layer = useRef(null);
  const hint = useRef(null);
  const nodes = useMemo(() => layout(items), [items]);
  const on = nodes.length > 0;

  useEffect(() => {
    if (!on) return;
    const sec = root.current, els = [...layer.current.children];
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 700px)');
    let cur = 0, target = 0, raf = 0;
    const hh = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hh')) * parseFloat(getComputedStyle(document.documentElement).fontSize) || 72;

    const read = () => {
      if (still.matches) return 0.3;
      const travel = sec.offsetHeight - sec.firstElementChild.offsetHeight;
      return travel > 0 ? Math.min(1, Math.max(0, (hh() - sec.getBoundingClientRect().top) / travel)) : 0;
    };
    const paint = () => {
      els.forEach((el, i) => {
        const f = frame(nodes[i].slot, cur);
        el.style.transform = f.transform; el.style.opacity = f.opacity;
        el.hidden = small.matches && i >= 7; // fewer dishes on phones
      });
      if (hint.current) hint.current.style.opacity = cur < 0.06 ? 1 : 0;
    };
    const tick = () => {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      paint();
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => { target = read(); if (!raf) raf = requestAnimationFrame(tick); };
    cur = target = read(); paint();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    still.addEventListener?.('change', kick);
    return () => { window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick); cancelAnimationFrame(raf); };
  }, [on, nodes]);

  return (
    <section ref={root} className={`hero${on ? ' scene' : ''}`} id="home">
      <div className="scene-stage">
        {bg}
        {on && (
          <div className="scene-3d" aria-hidden="true">
            <div className="scene-items" ref={layer}>
              {nodes.map((n, i) => {
                const f = frame(n.slot, 0);
                return (
                  <div key={i} className={`food${shape === 'round' ? ' round' : ''}`} style={{ '--y': `${n.slot[0]}%`, '--ym': `${10 + n.slot[0] * 0.8}%`, '--s': n.slot[2], transform: f.transform, opacity: f.opacity }}>
                    <img src={n.url} alt="" draggable="false" decoding="async" loading={i < 4 ? 'eager' : 'lazy'} style={{ animationDelay: `${-(i * 1.3).toFixed(1)}s` }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {on && <div className="scene-fade" aria-hidden="true" />}
        {children}
        {on && <div className="scene-hint" ref={hint} aria-hidden="true"><span>Scroll</span><i /></div>}
      </div>
    </section>
  );
}
