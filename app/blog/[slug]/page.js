import { notFound } from 'next/navigation';
import Link from 'next/link';
import Prose from '@/components/Prose';
import PostCard from '@/components/PostCard';
import ShareLinks from '@/components/ShareLinks';
import { createClient } from '@/lib/supabase/server';
import { dateLong } from '@/lib/format';
import { site, abs, description, headings, readingMinutes, wordCount, SITE_NAME } from '@/lib/blog';

async function load(slug) {
  const sb = await createClient();
  const { data } = await sb.from('posts').select('*').eq('slug', slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: 'Article not found', robots: { index: false } };
  const title = p.seo_title || p.title;
  const desc = description(p);
  const url = `/blog/${slug}`;
  const image = abs(p.cover_url);
  // Without a cover photo, Next serves the generated card from opengraph-image.js next to this file.
  return {
    title, description: desc,
    alternates: { canonical: url },
    authors: [{ name: SITE_NAME }],
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    openGraph: {
      type: 'article', url, title, description: desc, siteName: SITE_NAME, locale: 'en_US',
      publishedTime: p.published_at || undefined, modifiedTime: p.updated_at || p.published_at || undefined, authors: [SITE_NAME],
      ...(image ? { images: [{ url: image, alt: p.cover_alt || p.title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description: desc, ...(image ? { images: [image] } : {}) },
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  const sb = await createClient();
  const { data: more } = await sb.from('posts').select('title,slug,excerpt,cover_url,cover_alt,published_at,body').neq('slug', slug).order('published_at', { ascending: false }).limit(3);

  const url = `${site()}/blog/${slug}`;
  const toc = headings(p.body);
  const mins = readingMinutes(p.body);
  const image = abs(p.cover_url);
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }, headline: (p.seo_title || p.title).slice(0, 110), description: description(p),
      image: image ? [image] : [`${url}/opengraph-image`], datePublished: p.published_at, dateModified: p.updated_at || p.published_at,
      author: { '@type': 'Organization', name: SITE_NAME, url: site() },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: site(), logo: { '@type': 'ImageObject', url: `${site()}/logo` } },
      wordCount: wordCount(p.body), inLanguage: 'en-US', isPartOf: { '@type': 'Blog', name: `${SITE_NAME} Blog`, url: `${site()}/blog` },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [['Home', site()], ['Blog', `${site()}/blog`], [p.title, url]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="art">
        <header className="art-head wrap">
          <nav className="crumbs dark" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / <span aria-current="page">{p.title}</span></nav>
          <h1>{p.title}</h1>
          {p.excerpt && <p className="art-lede">{p.excerpt}</p>}
          <p className="art-meta">By {SITE_NAME}{p.published_at && <> &middot; <time dateTime={p.published_at}>{dateLong(p.published_at)}</time></>} &middot; {mins} min read</p>
        </header>
        {p.cover_url && <figure className="art-cover wrap"><img src={p.cover_url} alt={p.cover_alt || p.title} fetchPriority="high" /></figure>}
        <div className="wrap art-layout">
          {toc.length >= 3 && (
            <aside className="art-toc" aria-label="In this article">
              <details open>
                <summary>In this article</summary>
                <ol>{toc.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
              </details>
            </aside>
          )}
          <div className="prose art-body"><Prose body={p.body} /></div>
        </div>
        <div className="wrap art-foot"><ShareLinks url={url} title={p.title} /></div>
      </article>
      {more?.length > 0 && (
        <section className="section soft">
          <div className="wrap">
            <div className="sec-head"><h2>More from the blog</h2></div>
            <div className="post-grid">{more.map((m) => <PostCard key={m.slug} p={m} />)}</div>
            <div className="btn-row" style={{ justifyContent: 'center', marginTop: '2rem' }}><Link href="/blog" className="btn line">All articles</Link></div>
          </div>
        </section>
      )}
    </>
  );
}
