import { ImageResponse } from 'next/og';
import { siteUrl } from '@/lib/site';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

// Contact card (vCard 3.0) that saves cleanly on both iPhone and Android:
// structured name (N), CRLF line endings, folded lines, plain URLs and an embedded profile photo
// (phones ignore photo links, so the picture itself is inside the file).
const esc = (v) => String(v ?? '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
const fold = (line) => {
  const out = [];
  let rest = line;
  while (rest.length > 74) { out.push(rest.slice(0, 74)); rest = ' ' + rest.slice(74); }
  out.push(rest);
  return out.join('\r\n');
};

async function photoBase64(url, letter) {
  let buf = null;
  try {
    if (url) {
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (r.ok) buf = Buffer.from(await r.arrayBuffer());
    }
  } catch {}
  if (buf) {
    try {
      const sharp = (await import('sharp')).default;
      const jpg = await sharp(buf).rotate().resize(256, 256, { fit: 'cover' }).flatten({ background: '#ffffff' }).jpeg({ quality: 82 }).toBuffer();
      return { data: jpg.toString('base64'), type: 'JPEG' };
    } catch {
      if (buf.length < 120000) return { data: buf.toString('base64'), type: /png/i.test(url) ? 'PNG' : 'JPEG' };
    }
  }
  try {
    const img = new ImageResponse(
      (<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#9a4f26', color: '#fff', fontSize: 150, fontWeight: 700, border: '8px solid #ffd21a' }}>{letter}</div>),
      { width: 256, height: 256 }
    );
    return { data: Buffer.from(await img.arrayBuffer()).toString('base64'), type: 'PNG' };
  } catch { return null; }
}

export async function GET() {
  const s = await getSettings();
  const name = s.connect?.name || s.business_name;
  const lines = String(s.address || '').split('\n');
  const m = (lines[1] || '').match(/^(.*?),\s*([A-Za-z]{2})\s*(\d{5})?/);
  const site = siteUrl();
  const photo = await photoBase64(s.connect?.logo_url, name.slice(0, 1).toUpperCase());
  const socials = (s.connect?.socials || (s.connect?.links || []).map((l) => ({ url: l.url }))).map((l) => l.url).filter(Boolean);
  const extra = [s.instagram_url, s.facebook_url, ...socials].filter(Boolean);

  const rows = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(name)};;;;`,
    `FN:${esc(name)}`,
    `ORG:${esc(s.business_name)}`,
    `TITLE:${esc(s.connect?.tagline || 'Nepalese & Indian Cuisine')}`,
    s.phone && `TEL;TYPE=WORK,VOICE,pref:${esc(s.phone)}`,
    s.email && `EMAIL;TYPE=INTERNET,WORK:${esc(s.email)}`,
    `ADR;TYPE=WORK:;;${esc(lines[0])};${esc(m?.[1] || '')};${esc(m?.[2] || '')};${esc(m?.[3] || '')};USA`,
    site && `item1.URL;type=pref:${site}`,
    site && 'item1.X-ABLabel:Website',
    ...[...new Set(extra)].slice(0, 6).flatMap((u, i) => [`item${i + 2}.URL:${u}`, `item${i + 2}.X-ABLabel:Social`]),
    photo && `PHOTO;ENCODING=b;TYPE=${photo.type}:${photo.data}`,
    'END:VCARD',
  ].filter(Boolean).map(fold);

  return new Response(rows.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'inline; filename="himalayan-contact.vcf"',
      'Cache-Control': 'no-store',
    },
  });
}
