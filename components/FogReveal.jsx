'use client';
import { useEffect, useRef } from 'react';

// Restaurant photo behind heavy fog. The fog is made of soft blurred layers that slide apart
// (left layer left, right layer right, a third one lifting up) while the photo sharpens.
// Progress comes from where the frame sits in the window: fully fogged as it enters from the bottom,
// fully clear once it reaches the upper middle. Scrolling back up brings the fog back.
export default function FogReveal({ src, alt = '' }) {
  const box = useRef(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.style.setProperty('--p', 1); return; }
    let cur = -1, target = 0, raf = 0, vh = window.innerHeight;
    const read = () => {
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2;
      return Math.min(1, Math.max(0, (vh * 0.98 - c) / (vh * 0.52)));
    };
    const tick = () => {
      cur = cur < 0 ? target : cur + (target - cur) * 0.18;
      if (Math.abs(target - cur) < 0.002) cur = target;
      el.style.setProperty('--p', cur.toFixed(3));
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => { target = read(); if (!raf) raf = requestAnimationFrame(tick); };
    const size = () => { vh = window.innerHeight; kick(); };
    target = read(); cur = target; el.style.setProperty('--p', cur.toFixed(3));
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', size);
    return () => { window.removeEventListener('scroll', kick); window.removeEventListener('resize', size); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={box} className="fog-frame">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      <div className="fog-base" aria-hidden="true" />
      <div className="fog-layer fog-a" aria-hidden="true" />
      <div className="fog-layer fog-b" aria-hidden="true" />
      <div className="fog-layer fog-c" aria-hidden="true" />
    </div>
  );
}
