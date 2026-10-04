'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Photos are resized in the browser, then uploaded straight to Supabase Storage.
// (Sending big files through the server fails on Vercel, which is what crashed the old menu form.)
async function shrink(file, max = 1600) {
  if (!file.type.startsWith('image/') || /gif|svg/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return (await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85))) || file;
  } catch { return file; }
}

export default function MediaUpload({ name, initial, label, bucket = 'site', kind = 'image', typeName, hint }) {
  const [url, setUrl] = useState(initial || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const accept = kind === 'video' ? 'video/mp4,video/webm' : kind === 'image' ? 'image/*' : 'image/*,video/mp4,video/webm';
  const isVideo = /\.(mp4|webm)(\?|$)/i.test(url);

  async function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    const vid = /^video\/(mp4|webm)$/.test(f.type);
    if (!vid && !f.type.startsWith('image/')) return setErr('Please choose a photo, or an MP4 / WebM video.');
    if (kind === 'video' && !vid) return setErr('Please choose an MP4 or WebM video.');
    if (kind === 'image' && vid) return setErr('Please choose a photo.');
    if (f.size > 50 * 1024 * 1024) return setErr('That file is over 50 MB. Compress it first.');
    setBusy(true);
    const body = vid ? f : await shrink(f);
    const ext = vid ? (f.type === 'video/webm' ? 'webm' : 'mp4') : body.type === 'image/jpeg' ? 'jpg' : (f.type.split('/')[1] || 'jpg').replace('+xml', '');
    const path = `${vid ? 'video' : 'img'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const sb = createClient();
    const { error } = await sb.storage.from(bucket).upload(path, body, { contentType: body.type || f.type, cacheControl: '31536000' });
    setBusy(false);
    e.target.value = '';
    if (error) return setErr(`Upload failed: ${error.message}`);
    setUrl(sb.storage.from(bucket).getPublicUrl(path).data.publicUrl);
  }

  return (
    <div className="field">
      {label && <label htmlFor={`m-${name}`}>{label}</label>}
      {url && (isVideo ? <video src={url} muted loop playsInline autoPlay className="up-prev" /> : <img src={url} alt="" className="up-prev" />)}
      <input id={`m-${name}`} name={name} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Upload below, or paste a link" />
      {typeName && <input type="hidden" name={typeName} value={isVideo ? 'video' : 'image'} />}
      <div className="row">
        <input type="file" accept={accept} onChange={pick} disabled={busy} aria-label={`Upload ${label || 'file'}`} />
        {url && <button type="button" className="btn sm line" onClick={() => setUrl('')}>Remove</button>}
      </div>
      {busy && <span className="hint">Uploading, please wait...</span>}
      {err && <div className="error">{err}</div>}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
