import { getSettings } from '@/lib/settings';

const esc = (v) => String(v ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

// "Save contact" downloads the restaurant as a contact card (.vcf) that phones can import.
export async function GET() {
  const s = await getSettings();
  const name = s.connect?.name || s.business_name;
  const lines = s.address.split('\n');
  const m = (lines[1] || '').match(/^(.*?),\s*([A-Za-z]{2})\s*(\d{5})?/);
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const card = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `FN:${esc(name)}`, `ORG:${esc(s.business_name)}`, `TITLE:${esc(s.connect?.tagline || 'Nepalese & Indian Cuisine')}`,
    `TEL;TYPE=WORK,VOICE:${esc(s.phone)}`,
    s.email && `EMAIL;TYPE=WORK:${esc(s.email)}`,
    `ADR;TYPE=WORK:;;${esc(lines[0])};${esc(m?.[1] || '')};${esc(m?.[2] || '')};${esc(m?.[3] || '')};USA`,
    site && `URL:${esc(site)}`, 'END:VCARD',
  ].filter(Boolean).join('\r\n');
  return new Response(card, {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8', 'Content-Disposition': 'attachment; filename="himalayan-contact.vcf"', 'Cache-Control': 'public, max-age=300' },
  });
}
