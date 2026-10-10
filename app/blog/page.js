import PageHero from '@/components/PageHero';
import PostCard from '@/components/PostCard';
import { createClient } from '@/lib/supabase/server';
import { site, abs, SITE_NAME } from '@/lib/blog';

const DESC = 'Stories, recipes and news from Himalayan Nepalese & Indian Cuisine in San Marcos, TX: momos, curries, ingredients and what is happening in our kitchen.';
export const metadata = {
  title: 'Blog: Nepali and Indian food stories, recipes and news',
  description: DESC,
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/blog/feed.xml' } },
  openGraph: { type: 'website', url: '/blog', title: `Blog | ${SITE_NAME}`, description: DESC, siteName: SITE_NAME },
  twitter: { card: 'summary_large_image', title: `Blog | ${SITE_NAME}`, description: DESC },
};

export default async function Blog() {
  const sb = await createClient();
  const { data } = await sb.from('posts').select('title,slug,excerpt,cover_url,cover_alt,published_at,body').order('published_at', { ascending: false });
  const posts = data ?? [];
  const [first, ...rest] = posts;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Blog', name: `${SITE_NAME} Blog`, description: DESC, url: `${site()}/blog`, inLanguage: 'en-US',
    publisher: { '@type': 'Restaurant', name: SITE_NAME, url: site() },
    blogPost: posts.slice(0, 20).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${site()}/blog/${p.slug}`, datePublished: p.published_at, image: abs(p.cover_url) || undefined })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero title="Blog" sub="Stories, recipes and news from our kitchen." />
      <section className="section">
        <div className="wrap">
          {posts.length === 0 && <p className="lead">New stories are coming soon.</p>}
          {first && <div className="post-feature"><PostCard p={first} featured /></div>}
          {rest.length > 0 && <div className="post-grid">{rest.map((p) => <PostCard key={p.slug} p={p} />)}</div>}
          {posts.length > 0 && <p className="muted" style={{ marginTop: '2rem' }}><a href="/blog/feed.xml">Subscribe with RSS</a></p>}
        </div>
      </section>
    </>
  );
}
