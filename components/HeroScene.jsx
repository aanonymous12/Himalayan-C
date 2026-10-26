'use client';
import { useEffect, useMemo, useRef } from 'react';
import { frame, layout } from '@/lib/scene';

// Home hero. Layers, back to front: background (video, photo or plain) > restaurant table image with a
// transparent sky > dishes sliding across the table > headline and buttons > info strip.
// With dishes the hero stays pinned for a short scroll while they slide from right to left.
export default function HeroScene({ items = [], shape = 'cutout', layer, bg, strip, children }) {
  const root = useRef(null);
  const row = useRef(null);
  const hint = useRef(null);
  const nodes = useMemo(() => layout(items), [items]);
  const pinned = nodes.length > 0;

  useEffect(() => {
    if (!pinned) return;
    const sec = root.current, els = [...row.current.children];
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 700px)');
    let cur = 0, target = 0, raf = 0;
    const header = () => { const s = getComputedStyle(document.documentElement); return parseFloat(s.getPropertyValue('--hh')) * parseFloat(s.fontSize) || 72; };
    const read = () => {
      if (still.matches) return 0.25;
      const travel = sec.offsetHeight - sec.firstElementChild.offsetHeight;
      return travel > 0 ? Math.min(1, Math.max(0, (header() - sec.getBoundingClientRect().top) / travel)) : 0;
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
  }, [pinned, nodes]);

  return (
    <section ref={root} className={`hero${pinned ? ' scene' : ''}${layer ? ' has-table' : ''}`} id="home">
      <div className="scene-stage">
        {bg}
        {layer && <div className="scene-fade" aria-hidden="true" />}
        {children}
        {layer && (
          <div className="scene-table" aria-hidden="true">
            <img className="table-img" src={layer} alt="" fetchPriority="high" draggable="false" />
            {pinned && (
              <div className="scene-3d">
                <div className="scene-items" ref={row}>
                  {nodes.map((n, i) => {
                    const f = frame(n.slot, 0);
                    return (
                      <div key={i} className={`food${shape === 'round' ? ' round' : ''}`} style={{ '--r': n.slot[0], '--s': n.slot[1], zIndex: 20 - Math.round(n.slot[0] * 10), transform: f.transform, opacity: f.opacity }}>
                        <img src={n.url} alt="" draggable="false" decoding="async" loading={i < 4 ? 'eager' : 'lazy'} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {pinned && <div className="scene-hint" ref={hint}><span>Scroll</span><i /></div>}
          </div>
        )}
        {strip}
      </div>
    </section>
  );
}
