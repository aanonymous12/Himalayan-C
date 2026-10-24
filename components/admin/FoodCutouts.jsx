'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Food images for the home page 3D scroll. Transparent PNG / WebP cut-outs look best.
// Images are resized in the browser and saved as WebP so transparency is kept.
async function prepare(file, max = 1000) {
  if (/gif|svg/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const webp = await new Promise((r) => c.toBlob(r, 'image/webp', 0.9));
    if (webp && webp.type === 'image/webp') return webp;
    return (await new Promise((r) => c.toBlob(r, 'image/png'))) || file;
  } catch { return file; }
}

export default function FoodCutouts({ initial = [] }) {
  const [urls, setUrls] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function add(e) {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setErr(null);
    if (urls.length + files.length > 12) return setErr('You can add up to 12 images.');
    setBusy(true);
    const sb = createClient();
    const added = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) { setErr('Only images can be added here.'); continue; }
      if (f.size > 20 * 1024 * 1024) { setErr(`${f.name} is over 20 MB.`); continue; }
      const body = await prepare(f);
      const ext = body.type === 'image/webp' ? 'webp' : body.type === 'image/png' ? 'png' : (f.type.split('/')[1] || 'png');
      const path = `food-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from('site').upload(path, body, { contentType: body.type || f.type, cacheControl: '31536000' });
      if (error) { setErr(`Upload failed: ${error.message}`); continue; }
      added.push(sb.storage.from('site').getPublicUrl(path).data.publicUrl);
    }
    setUrls((u) => [...u, ...added]);
    setBusy(false);
  }
  const move = (i, d) => setUrls((u) => { const a = [...u], j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });

  return (
    <div className="field">
      <span className="lbl">Food images ({urls.length} of 12)</span>
      <input type="hidden" name="hero3d_items" value={JSON.stringify(urls)} />
      {urls.length > 0 && (
        <ul className="food-list">
          {urls.map((u, i) => (
            <li key={u + i}>
              <img src={u} alt={`Food image ${i + 1}`} />
              <div className="row" style={{ gap: '.25rem', justifyContent: 'center' }}>
                <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">&#8592;</button>
                <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === urls.length - 1} aria-label="Move later">&#8594;</button>
                <button type="button" className="icon-btn" onClick={() => setUrls(urls.filter((_, k) => k !== i))} aria-label="Remove image">&times;</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <input type="file" accept="image/png,image/webp,image/jpeg" multiple onChange={add} disabled={busy || urls.length >= 12} aria-label="Add food images" />
      {busy && <span className="hint">Uploading, please wait...</span>}
      {err && <div className="error">{err}</div>}
      <span className="hint">Use dishes photographed from above with a transparent background (PNG or WebP). Free tools like remove.bg make these in seconds. Fewer than 8 images repeat to fill the scene. The first images appear nearest the viewer.</span>
    </div>
  );
}
