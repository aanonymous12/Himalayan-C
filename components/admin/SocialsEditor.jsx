'use client';
import { useEffect, useRef, useState } from 'react';
import SocialIcon from '../SocialIcon';
import { PLATFORMS, platformOf } from '@/lib/socials';

// Rows of [platform dropdown with icons] + [link] + remove. The result travels as one hidden JSON field.
function Picker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  const cur = platformOf(value);
  return (
    <div className="sp-pick" ref={box}>
      <button type="button" className="sp-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>
        <SocialIcon name={value} size={20} /><span>{cur.label}</span><i aria-hidden="true">&#9662;</i>
      </button>
      {open && (
        <ul className="sp-list" role="listbox">
          {PLATFORMS.map((p) => (
            <li key={p.key} role="option" aria-selected={p.key === value}>
              <button type="button" onClick={() => { onChange(p.key); setOpen(false); }}><SocialIcon name={p.key} size={20} /><span>{p.label}</span></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SocialsEditor({ initial = [] }) {
  const [rows, setRows] = useState(initial.length ? initial : []);
  const set = (i, patch) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  return (
    <div className="field">
      <span className="lbl">Social media and links</span>
      <input type="hidden" name="socials" value={JSON.stringify(rows)} />
      <div className="sp-rows">
        {rows.length === 0 && <p className="hint" style={{ margin: 0 }}>No links yet. Add Instagram, TikTok, Facebook, delivery apps and more.</p>}
        {rows.map((r, i) => (
          <div className="sp-row" key={i}>
            <Picker value={r.platform} label={`Platform for link ${i + 1}`} onChange={(p) => set(i, { platform: p })} />
            <input type="url" inputMode="url" aria-label={`Link ${i + 1}`} placeholder={platformOf(r.platform).hint} value={r.url} onChange={(e) => set(i, { url: e.target.value })} autoComplete="off" />
            <button type="button" className="icon-btn" aria-label={`Remove link ${i + 1}`} onClick={() => setRows(rows.filter((_, k) => k !== i))}>&times;</button>
          </div>
        ))}
      </div>
      {rows.length < 12 && <button type="button" className="btn sm line" style={{ marginTop: '.75rem' }} onClick={() => setRows([...rows, { platform: 'instagram', url: '' }])}>+ Add a link</button>}
      <span className="hint" style={{ display: 'block', marginTop: '.5rem' }}>Each link shows with its own icon on the business card. Instagram, Facebook, Google reviews and delivery links already set in Settings appear too, unless you add the same platform here.</span>
    </div>
  );
}
