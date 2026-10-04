import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { createClient } from '@/lib/supabase/server';
import { dateLong } from '@/lib/format';

export const metadata = {
  title: 'Journal',
  description: 'Stories, recipes and news from Himalayan Nepalese & Indian Cuisine in San Marcos, TX.',
  alternates: { canonical: '/blog' },
};

export default async function Blog() {
  const sb = await createClient();
  const { data } = await sb.from('posts').select('title,slug,excerpt,cover_url,published_at').order('published_at', { ascending: false });
  const posts = data ?? [];
  return (
    <>
      <PageHero title="Journal" sub="Stories, recipes and news from our kitchen." />
      <section className="section">
        <div className="wrap">
          {posts.length === 0 && <p className="lead">New stories are coming soon.</p>}
          <div className="post-grid">
            {posts.map((p) => (
              <Link href={`/blog/${p.slug}`} className="post-card" key={p.slug}>
                {p.cover_url ? <img src={p.cover_url} alt="" loading="lazy" /> : <div className="ph" />}
                <div><span className="date muted">{p.published_at && dateLong(p.published_at)}</span><h3>{p.title}</h3>{p.excerpt && <p>{p.excerpt}</p>}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
