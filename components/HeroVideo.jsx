'use client';
import { useEffect, useRef, useState } from 'react';

// Muted looping background video with a pause control.
// Visitors who prefer reduced motion get a paused video.
export default function HeroVideo({ src }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ref.current?.pause();
      setPlaying(false);
    }
  }, []);

  function toggle() {
    const v = ref.current;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  }

  return (
    <>
      <video ref={ref} className="hero-video" src={src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <button type="button" className="video-toggle" onClick={toggle} aria-label={playing ? 'Pause background video' : 'Play background video'}>
        {playing ? 'Pause video' : 'Play video'}
      </button>
    </>
  );
}
