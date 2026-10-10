import { createClient } from '@/lib/supabase/server';

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap() {
  const pages = ['', '/menu', '/gallery', '/buffet', '/blog']
    .map((p) => ({ url: `${site}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }));
  try {
    const sb = await createClient();
    const { data } = await sb.from('posts').select('slug,published_at');
    return [...pages, ...(data || []).map((p) => ({ url: `${site}/blog/${p.slug}`, lastModified: p.published_at }))];
  } catch { return pages; }
}
