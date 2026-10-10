import { createPublicClient } from '@/lib/supabase/public';

const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const pages = [['', 1], ['/menu', 0.9], ['/blog', 0.8], ['/gallery', 0.6], ['/buffet', 0.6]]
    .map(([p, priority]) => ({ url: `${site}${p}`, changeFrequency: 'weekly', priority }));
  try {
    const { data } = await createPublicClient().from('posts').select('slug,published_at,updated_at,cover_url').order('published_at', { ascending: false });
    return [...pages, ...(data || []).map((p) => ({
      url: `${site}/blog/${p.slug}`, lastModified: p.updated_at || p.published_at, changeFrequency: 'monthly', priority: 0.7,
      ...(p.cover_url ? { images: [p.cover_url] } : {}),
    }))];
  } catch { return pages; }
}
