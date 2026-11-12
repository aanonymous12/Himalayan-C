import { ImageResponse } from 'next/og';
import { siteUrl } from '@/lib/site';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

// Contact card (vCard 3.0), written the same way the iPhone Contacts app writes its own exports so that
// Apple's parser (used by Safari AND by Chrome on iPhone) always accepts it. Android reads the same file.
// A card Apple cannot parse makes the iPhone do nothing at all, so everything here is kept conservative:
// only a real JPEG or PNG is ever embedded as the photo, lines are folded, endings are CRLF.
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

export async function GET(req) {
  const s = await getSettings();
  const name = String(s.connect?.name || s.business_name || 'Himalayan').trim();
  const lines = String(s.address || '').split('\n');
  const m = (lines[1] || '').match(/^(.*?),\s*([A-Za-z]{2})\s*(\d{5})?/);
  const site = clean(siteUrl());
  const pic = await photo(s.connect?.logo_url, name.slice(0, 1).toUpperCase());
  const digits = String(s.phone || '').replace(/\D/g, '');
  const tel = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits[0] === '1' ? `+${digits}` : String(s.phone || '').trim();
  const socials = (s.connect?.socials || s.connect?.links || []).map((l) => l?.url);
  const extra = [...new Set([s.instagram_url, s.facebook_url, ...socials].map(clean).filter((u) => /^https?:\/\//i.test(u) && u !== site))].slice(0, 6);

  const rows = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:;;;;',
    `FN:${esc(name)}`,
    `ORG:${esc(s.business_name || name)};`,
    'X-ABShowAs:COMPANY',
    tel && `TEL;type=WORK;type=VOICE;type=pref:${tel}`,
    s.email && `EMAIL;type=INTERNET;type=WORK;type=pref:${clean(s.email)}`,
    lines[0] && `ADR;type=WORK;type=pref:;;${esc(lines[0])};${esc(m?.[1] || '')};${esc(m?.[2] || '')};${esc(m?.[3] || '')};United States`,
    site && `item1.URL;type=pref:${site}`,
    site && 'item1.X-ABLabel:_$!<HomePage>!$_',
    ...extra.flatMap((u, i) => [`item${i + 2}.URL:${u}`, `item${i + 2}.X-ABLabel:_$!<Other>!$_`]),
    `NOTE:${esc(s.connect?.tagline || 'Nepalese & Indian Cuisine')}`,
    pic && `PHOTO;ENCODING=b;TYPE=${pic.type}:${pic.data.toString('base64')}`,
    'END:VCARD',
  ].filter(Boolean).map(fold);

  const body = Buffer.from(rows.join('\r\n') + '\r\n', 'utf8');
  // ?dl=1 asks for a download instead of opening in place (used as the fallback for browsers inside apps).
  const dl = new URL(req.url).searchParams.get('dl') === '1';
  return new Response(body, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Length': String(body.length),
      'Content-Disposition': `${dl ? 'attachment' : 'inline'}; filename="himalayan-contact.vcf"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
}
