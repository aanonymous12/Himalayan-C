'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Photos for the About page "walk inside" scroll, in order from the street to the dining room.
async function prepare(file, max = 2000) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return (await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85))) || file;
  } catch { return file; }
}

export default function WalkSteps({ initial = [], enabled = true, defaults = [] }) {
  const [steps, setSteps] = useState(initial.length ? initial : defaults);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function add(e) {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setErr(null);
    if (steps.length + files.length > 8) return setErr('You can add up to 8 photos.');
    setBusy(true);
    const sb = createClient();
    const added = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) { setErr('Only photos can be added here.'); continue; }
      if (f.size > 25 * 1024 * 1024) { setErr(`${f.name} is over 25 MB.`); continue; }
      const body = await prepare(f);
      const path = `walk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await sb.storage.from('site').upload(path, body, { contentType: body.type || 'image/jpeg', cacheControl: '31536000' });
      if (error) { setErr(`Upload failed: ${error.message}`); continue; }
      added.push({ url: sb.storage.from('site').getPublicUrl(path).data.publicUrl, caption: '' });
    }
    // the first upload replaces the built-in photos
    setSteps((s) => [...(s === defaults ? [] : s), ...added]);
    setBusy(false);
  }
  const move = (i, d) => setSteps((u) => { const a = [...u], j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const cap = (i, v) => setSteps((u) => u.map((s, k) => (k === i ? { ...s, caption: v } : s)));
  const real = steps === defaults ? [] : steps;

  return (
    <div className="panel" style={{ marginBottom: '1.5rem' }}>
      <h2>About page: walk inside</h2>
      <p className="muted">As visitors scroll the About section, the photos zoom in one after another, like walking from the street into the restaurant. Add them in order: outside first, deepest inside last.</p>
      <label className="check-row" style={{ marginTop: 0, marginBottom: '1rem' }}><input type="checkbox" name="walk_enabled" defaultChecked={enabled} /><span>Show the walk-through</span></label>
      <input type="hidden" name="walk_steps" value={JSON.stringify(real)} />
      <ol className="walk-admin">
        {steps.map((s, i) => (
          <li key={s.url + i}>
            <img src={s.url} alt={`Step ${i + 1}`} />
            <div className="walk-admin-body">
              <b>Step {i + 1}{i === 0 ? ' (outside)' : i === steps.length - 1 ? ' (deepest inside)' : ''}</b>
              <input type="text" value={s.caption || ''} maxLength={60} placeholder="Caption, e.g. Step inside" onChange={(e) => cap(i, e.target.value)} aria-label={`Caption for step ${i + 1}`} disabled={steps === defaults} />
              {steps !== defaults && (
                <div className="row" style={{ gap: '.25rem' }}>
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">&#8593;</button>
                  <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === steps.length - 1} aria-label="Move later">&#8595;</button>
                  <button type="button" className="icon-btn" onClick={() => setSteps(steps.filter((_, k) => k !== i))} aria-label="Remove photo">&times;</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={add} disabled={busy || steps.length >= 8} aria-label="Add walk-through photos" />
      {busy && <span className="hint">Uploading, please wait...</span>}
      {err && <div className="error">{err}</div>}
      <span className="hint">{steps === defaults ? 'These are the built-in photos. Adding your own replaces all three; you can then reorder, caption and remove them.' : 'Use 2 to 8 wide landscape photos, about 1600 px across or more. At least 2 are needed, otherwise the built-in photos are used.'}</span>
    </div>
  );
}
