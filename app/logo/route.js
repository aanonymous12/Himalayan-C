import { ImageResponse } from 'next/og';

// Square brand mark used as the publisher logo in structured data.
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#9a4f26', color: '#fff', fontSize: 300, fontWeight: 700, border: '16px solid #ffd21a' }}>H</div>
    ),
    { width: 512, height: 512 }
  );
}
