import { ImageResponse } from 'next/og';
import { createPublicClient } from '@/lib/supabase/public';

export const alt = 'Himalayan Nepalese & Indian Cuisine blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Share card used when an article has no cover photo.
export default async function Image({ params }) {
  const { slug } = await params;
  let title = 'Himalayan Nepalese & Indian Cuisine';
  try {
    const { data } = await createPublicClient().from('posts').select('title').eq('slug', slug).maybeSingle();
    if (data?.title) title = data.title;
  } catch {}
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#2b1810', padding: 72, color: '#fff', borderBottom: '16px solid #ffd21a' }}>
        <div style={{ display: 'flex', fontSize: 34, letterSpacing: 6, color: '#ffd21a', textTransform: 'uppercase' }}>Himalayan Blog</div>
        <div style={{ display: 'flex', fontSize: title.length > 70 ? 60 : 78, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 32, color: '#e6d9cf' }}>Nepalese &amp; Indian Cuisine · San Marcos, TX</div>
      </div>
    ),
    size
  );
}
