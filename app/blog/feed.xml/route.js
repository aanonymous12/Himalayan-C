import { createPublicClient } from '@/lib/supabase/public';
import { site, description, SITE_NAME } from '@/lib/blog';

export const dynamic = 'force-dynamic';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// RSS feed of published articles.
export async function GET() {
  let posts = [];
  try {
    const { data } = await createPublicClient().from('posts').select('*').order('published_at', { ascending: false }).limit(30);
    posts = data || [];
  } catch {}
  const base = site();
  const items = posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${base}/blog/${p.slug}</link>
      <guid isPermaLink="true">${base}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.published_at || p.created_at).toUTCString()}</pubDate>
      <description>${esc(description(p))}</description>
      ${p.cover_url ? `<enclosure url="${esc(p.cover_url)}" type="image/jpeg" length="0" />` : ''}
    </item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} Blog</title>
    <link>${base}/blog</link>
    <atom:link href="${base}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Stories, recipes and news from our kitchen in San Marcos, TX.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } });
}
