'use client';
import { useEffect, useRef } from 'react';

// Scroll-driven walk from the street into the dining room. The section stays pinned; each photo is
// "walked into" (it scales and moves toward the viewer while its centre fades out) and the next photo
// comes forward out of the depth behind it. Only transform and opacity change, once per frame.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

function place(t, flat) {
  // t = position of this photo relative to the camera: 0 = in front, 1 = just left behind, -1 = far ahead
  if (t >= 1) return { o: 0, tf: 'translate3d(0,0,0) scale(2.2)' };
  if (t >= 0) { // walking into it
    const e = smooth(t);
    const z = e * (flat ? 0 : 260), s = 1 + e * 0.9;
    return { o: 1 - smooth(clamp((t - 0.35) / 0.55)), tf: `translate3d(0, 0, ${z.toFixed(1)}px) scale(${s.toFixed(3)}) rotateX(${(e * 2).toFixed(2)}deg)` };
  }
  if (t > -1) { // emerging from the depth
    const k = -t;
    const e = smooth(k);
    const z = -e * (flat ? 0 : 320), s = 1 - e * 0.28;
    return { o: smooth(clamp((1 - k - 0.15) / 0.6)), tf: `translate3d(0, ${(e * 3).toFixed(2)}%, ${z.toFixed(1)}px) scale(${s.toFixed(3)})` };
  }
  return { o: 0, tf: 'translate3d(0,0,-320px) scale(.7)' };
}

export default function WalkThrough({ steps }) {
  const root = useRef(null);
  const n = steps.length;

  useEffect(() => {
    const sec = root.current;
    if (!sec || n < 2) return;
    const imgs = [...sec.querySelectorAll('.walk-img')], caps = [...sec.querySelectorAll('.walk-cap')], dots = [...sec.querySelectorAll('.walk-dots i')];
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 700px)');
    let cur = 0, target = 0, raf = 0, top = 0, travel = 1, head = 72, flat = false;
    const measure = () => {
      const st = getComputedStyle(document.documentElement);
      head = parseFloat(st.getPropertyValue('--hh')) * parseFloat(st.fontSize) || 72;
      travel = Math.max(1, sec.offsetHeight - sec.firstElementChild.offsetHeight);
      top = sec.getBoundingClientRect().top + window.scrollY;
      flat = small.matches;
    };
    const read = () => clamp((window.scrollY + head - top) / travel);
    const paint = () => {
      const pos = cur * (n - 1);
      imgs.forEach((el, i) => { const f = place(i - pos, flat); el.style.opacity = f.o.toFixed(3); el.style.transform = f.tf; el.style.visibility = f.o < 0.005 ? 'hidden' : 'visible'; });
      caps.forEach((el, i) => { const d = Math.abs(i - pos); el.style.opacity = clamp(1 - d * 2.2).toFixed(3); el.style.transform = `translate3d(0, ${((i - pos) * 18).toFixed(1)}px, 0)`; });
      dots.forEach((el, i) => el.classList.toggle('on', Math.round(pos) === i));
    };
    const tick = () => {
      cur += (target - cur) * (flat ? 0.28 : 0.2);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      paint();
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => { target = read(); if (!raf) raf = requestAnimationFrame(tick); };
    const remeasure = () => { measure(); kick(); };
    if (still.matches) { sec.classList.add('walk-static'); return; }
    measure(); cur = target = read(); paint();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    window.addEventListener('pageshow', remeasure);
    const settle = setTimeout(remeasure, 400);
    return () => { window.removeEventListener('scroll', kick); window.removeEventListener('resize', remeasure); window.removeEventListener('load', remeasure); window.removeEventListener('pageshow', remeasure); clearTimeout(settle); cancelAnimationFrame(raf); };
  }, [n]);

  if (n < 2) return null;
  return (
    <section ref={root} id="inside" className="walk" style={{ '--steps': n }} aria-label="A walk through the restaurant">
      <div className="walk-stage">
        <div className="walk-3d">
          {steps.map((s, i) => (
            <img key={s.url + i} className="walk-img" src={s.url} alt={s.caption || `Restaurant photo ${i + 1}`} decoding="async" loading={i < 2 ? 'eager' : 'lazy'} draggable="false"
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden', zIndex: n - i }} />
          ))}
        </div>
        <div className="walk-shade" aria-hidden="true" />
        <div className="walk-caps">
          {steps.map((s, i) => <p key={i} className="walk-cap" style={{ opacity: i === 0 ? 1 : 0 }}>{s.caption}</p>)}
        </div>
        <div className="walk-dots" aria-hidden="true">{steps.map((_, i) => <i key={i} className={i === 0 ? 'on' : ''} />)}</div>
      </div>
    </section>
  );
}
