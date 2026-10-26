'use client';
import { useEffect, useMemo, useRef } from 'react';
import { frame, layout, PHONE_COUNT } from '@/lib/scene';

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
    let cur = 0, target = 0, raf = 0, top = 0, travel = 1, head = 72, flat = false, last = -1;
    // Measured once (and on resize), never while scrolling, so scrolling stays light on phones.
    const measure = () => {
      const st = getComputedStyle(document.documentElement);
      head = parseFloat(st.getPropertyValue('--hh')) * parseFloat(st.fontSize) || 72;
      travel = Math.max(1, sec.offsetHeight - sec.firstElementChild.offsetHeight);
      top = sec.getBoundingClientRect().top + window.scrollY;
      flat = small.matches;
      els.forEach((el, i) => { el.hidden = flat && i >= PHONE_COUNT; });
    };
    const read = () => (still.matches ? 0.9 : window.scrollY < 6 ? 0 : Math.min(1, Math.max(0, (window.scrollY + head - top) / travel)));
    const paint = () => {
      els.forEach((el, i) => {
        if (el.hidden) return;
        const f = frame(nodes[i].slot, cur, flat);
        el.style.transform = f.transform; el.style.opacity = f.opacity;
      });
      if (hint.current) { const v = cur < 0.05 ? 1 : 0; if (v !== last) { hint.current.style.opacity = v; last = v; } }
    };
    const tick = () => {
      cur += (target - cur) * (flat ? 0.3 : 0.22);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      paint();
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => { target = read(); if (!raf) raf = requestAnimationFrame(tick); };
    const remeasure = () => { measure(); kick(); };
    measure(); cur = target = read(); paint();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    window.addEventListener('pageshow', remeasure);
    const settle = setTimeout(remeasure, 350); // layout, fonts and the restored scroll position have settled by now
    still.addEventListener?.('change', remeasure);
    return () => { window.removeEventListener('scroll', kick); window.removeEventListener('resize', remeasure); window.removeEventListener('load', remeasure); window.removeEventListener('pageshow', remeasure); clearTimeout(settle); cancelAnimationFrame(raf); };
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
