import { ImageResponse } from 'next/og';
import { siteUrl } from '@/lib/site';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

// Contact card (vCard 3.0) for iPhone and Android. Kept deliberately plain: a phone that cannot parse the
// card refuses the whole file, so only standard fields are used, text is cleaned, endings are CRLF and
// only a real JPEG or PNG is ever embedded as the photo.
const esc = (v) => String(v ?? '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
const clean = (u) => String(u || '').trim().replace(/[\r\n\s]+/g, '');
const fold = (line) => {
  if (line.length <= 75) return line;
  const out = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) out.push(' ' + line.slice(i, i + 74));
  return out.join('\r\n');
};
const kind = (b) => (b[0] === 0xff && b[1] === 0xd8 ? 'JPEG' : b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 ? 'PNG' : null);

async function toJpeg(buf) {
  const sharp = (await import('sharp')).default;
  return sharp(buf).rotate().resize(256, 256, { fit: 'cover' }).flatten({ background: '#ffffff' }).jpeg({ quality: 80 }).toBuffer();
}

async function photo(url, letter) {
  // 1. The logo from Dashboard > Business card.
  try {
    if (url) {
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        try { return { data: await toJpeg(buf), type: 'JPEG' }; } catch {}
        // No resizer available: use the file as it is, but only if it really is a small JPEG or PNG.
        if (kind(buf) && buf.length < 100000) return { data: buf, type: kind(buf) };
      }
    }
  } catch {}
  // 2. Brand tile with the first letter.
  try {
    const img = new ImageResponse(
      (<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#9a4f26', color: '#fff', fontSize: 150, fontWeight: 700, border: '8px solid #ffd21a' }}>{letter}</div>),
      { width: 256, height: 256 }
    );
    const png = Buffer.from(await img.arrayBuffer());
    try { return { data: await toJpeg(png), type: 'JPEG' }; } catch {}
    if (kind(png)) return { data: png, type: 'PNG' };
  } catch {}
  return null;
}

const safe = (v) => String(v ?? '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').replace(/[\u2028\u2029]/g, ' ').trim();

function build(s, pic, withExtras) {
  const c = s.connect || {};
  const name = safe(c.name || s.business_name || 'Himalayan Nepalese & Indian Cuisine');
  const lines = safe(s.address).split('\n').map((l) => l.trim());
  const m = (lines[1] || '').match(/^(.*?),\s*([A-Za-z]{2})\s*(\d{5})?/);
  const site = clean(siteUrl());
  const phone = safe(c.phone || s.phone);
  const digits = phone.replace(/\D/g, '');
  const tel = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits[0] === '1' ? `+${digits}` : phone.replace(/[^\d+()\-. ]/g, '');
  const email = clean(s.email);
  const socials = (c.socials || c.links || []).map((l) => l?.url);
  const extra = withExtras ? [...new Set([s.instagram_url, s.facebook_url, ...socials].map(clean).filter((u) => /^https?:\/\/[^\s]+$/i.test(u) && u !== site))].slice(0, 6) : [];
  // Plain, widely supported vCard 3.0. Text lines are not folded (folding is optional and is where files
  // get damaged); only the photo, which is plain letters and digits, is folded.
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(name)};;;;`,
    `FN:${esc(name)}`,
    `ORG:${esc(safe(s.business_name) || name)}`,
    tel && `TEL;TYPE=WORK,VOICE:${tel}`,
    /^[^\s@]+@[^\s@]+$/.test(email) && `EMAIL;TYPE=INTERNET,WORK:${email}`,
    lines[0] && `ADR;TYPE=WORK:;;${esc(lines[0])};${esc(m?.[1] || '')};${esc(m?.[2] || '')};${esc(m?.[3] || '')};USA`,
    /^https?:\/\//i.test(site) && `URL:${site}`,
    ...extra.map((u) => `URL:${u}`),
    pic && fold(`PHOTO;ENCODING=b;TYPE=${pic.type}:${pic.data.toString('base64')}`),
    'END:VCARD',
  ].filter(Boolean).join('\r\n') + '\r\n';
}

export async function GET(req) {
  const q = new URL(req.url).searchParams;
  let card;
  try {
    const s = await getSettings();
    const name = safe(s.connect?.name || s.business_name || 'H');
    // ?photo=0 leaves the picture out (for testing a phone that refuses the card).
    const pic = q.get('photo') === '0' ? null : await photo(s.connect?.logo_url, (name.match(/[A-Za-z0-9]/)?.[0] || 'H').toUpperCase());
    card = build(s, pic, q.get('plain') !== '1');
  } catch {
    card = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Himalayan Nepalese & Indian Cuisine;;;;', 'FN:Himalayan Nepalese & Indian Cuisine', 'TEL;TYPE=WORK,VOICE:+15127480104', 'END:VCARD'].join('\r\n') + '\r\n';
  }
  // ?dl=1 asks for a download instead of opening in place (fallback for browsers inside apps).
  return new Response(card, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `${q.get('dl') === '1' ? 'attachment' : 'inline'}; filename="himalayan-contact.vcf"`,
      'Cache-Control': 'no-store, no-transform',
    },
  });
}
