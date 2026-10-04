'use client';
import { useEffect, useState } from 'react';
import Icon from './Icon';

const CATS = [['all', 'All'], ['food', 'Food'], ['restaurant', 'Restaurant'], ['events', 'Events']];

export default function GalleryGrid({ items }) {
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(null);
  const shown = items.filter((i) => cat === 'all' || i.category === cat);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o + 1) % shown.length);
      if (e.key === 'ArrowLeft') setOpen((o) => (o - 1 + shown.length) % shown.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, shown.length]);

  const cur = open !== null ? shown[open] : null;
  return (
    <>
      <div className="filters" role="group" aria-label="Filter gallery">
        {CATS.map(([k, label]) => <button key={k} className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>{label}</button>)}
      </div>
      {shown.length === 0 && <p className="muted">Nothing here yet. Check back soon.</p>}
      <div className="gallery">
        {shown.map((it, i) => (
          <button key={it.id} className="g-item" onClick={() => setOpen(i)} aria-label={it.caption || `Open ${it.media_type} ${i + 1}`}>
            {it.media_type === 'video' ? <><video src={it.url} muted playsInline preload="metadata" /><span className="g-play"><Icon name="play" size={18} /></span></> : <img src={it.url} alt={it.caption || ''} loading="lazy" />}
            {it.caption && <span className="g-cap">{it.caption}</span>}
          </button>
        ))}
      </div>
      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery viewer" onClick={() => setOpen(null)}>
          <button className="lb-btn" style={{ top: '1rem', right: '1rem' }} onClick={() => setOpen(null)} aria-label="Close">&times;</button>
          {shown.length > 1 && <>
            <button className="lb-btn" style={{ left: '1rem', top: '50%' }} onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + shown.length) % shown.length); }} aria-label="Previous">&#8249;</button>
            <button className="lb-btn" style={{ right: '1rem', top: '50%' }} onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % shown.length); }} aria-label="Next">&#8250;</button>
          </>}
          <figure onClick={(e) => e.stopPropagation()}>
            {cur.media_type === 'video' ? <video src={cur.url} controls autoPlay playsInline /> : <img src={cur.url} alt={cur.caption || ''} />}
            {cur.caption && <figcaption>{cur.caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
