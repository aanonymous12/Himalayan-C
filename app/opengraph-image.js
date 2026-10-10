import { ImageResponse } from 'next/og';

export const alt = 'Himalayan Nepalese & Indian Cuisine, San Marcos, TX';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Default share card for every page that has no image of its own.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#2b1810', padding: 80, color: '#fff', borderBottom: '16px solid #ffd21a' }}>
        <div style={{ display: 'flex', fontSize: 110, fontWeight: 700 }}>Himalayan</div>
        <div style={{ display: 'flex', fontSize: 38, letterSpacing: 8, color: '#ffd21a', textTransform: 'uppercase', marginTop: 8 }}>Nepalese &amp; Indian Cuisine</div>
        <div style={{ display: 'flex', fontSize: 36, color: '#e6d9cf', marginTop: 48 }}>Momos, curries, biryani and tandoor naan · 115 Wonder World Drive, San Marcos, TX</div>
      </div>
    ),
    size
  );
}
