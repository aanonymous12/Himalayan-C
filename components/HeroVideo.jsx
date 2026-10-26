'use client';
import { useEffect, useRef, useState } from 'react';

// Muted looping background video that starts by itself, with a pause control.
// Browsers only autoplay muted video, and React does not always put the `muted` attribute in the page,
// so it is set here and play() is retried until the browser accepts it. The photo shows until the first frame.
export default function HeroVideo({ src, poster }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const go = () => { if (still || !v.paused) return; const r = v.play(); if (r && r.catch) r.catch(() => {}); };
    const onPlay = () => { setPlaying(true); setReady(true); };
    const onPause = () => setPlaying(false);
    const wake = () => { go(); if (!v.paused) off(); };
    const off = () => ['touchstart', 'pointerdown', 'scroll', 'click', 'keydown'].forEach((e) => window.removeEventListener(e, wake));
    const vis = () => { if (!document.hidden) go(); };
    v.addEventListener('playing', onPlay); v.addEventListener('pause', onPause);
    v.addEventListener('loadeddata', go); v.addEventListener('canplay', go);
    document.addEventListener('visibilitychange', vis);
    // some phones (low power mode) wait for a first touch or scroll
    ['touchstart', 'pointerdown', 'scroll', 'click', 'keydown'].forEach((e) => window.addEventListener(e, wake, { passive: true }));
    if (v.readyState >= 2) setReady(true);
    v.load(); go();
    return () => { off(); v.removeEventListener('playing', onPlay); v.removeEventListener('pause', onPause); v.removeEventListener('loadeddata', go); v.removeEventListener('canplay', go); document.removeEventListener('visibilitychange', vis); };
  }, [src]);

  function toggle() {
    const v = ref.current;
    if (v.paused) { const r = v.play(); if (r && r.catch) r.catch(() => {}); } else v.pause();
  }

  return (
    <>
      {poster && <img className="hero-video" src={poster} alt="" />}
      <video ref={ref} className="hero-video" style={{ opacity: ready ? 1 : 0, transition: 'opacity .5s' }} src={src} poster={poster || undefined} autoPlay muted loop playsInline preload="auto" aria-hidden="true" disablePictureInPicture />
      <button type="button" className="video-toggle" onClick={toggle} aria-label={playing ? 'Pause background video' : 'Play background video'}>
        {playing ? 'Pause video' : 'Play video'}
      </button>
    </>
  );
}
