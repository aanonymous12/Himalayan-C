import { notFound } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBand from '@/components/CtaBand';
import { createClient } from '@/lib/supabase/server';
import { dateLong } from '@/lib/format';

async function load(slug) {
  const sb = await createClient();
  const { data } = await sb.from('posts').select('*').eq('slug', slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt || undefined, alternates: { canonical: `/blog/${slug}` }, openGraph: { images: p.cover_url ? [p.cover_url] : undefined } };
}

// Plain text in, safe HTML out: blank line = new paragraph, "## " = heading.
function Body({ text }) {
  return text.split(/\n\s*\n/).map((blk, i) => {
    const b = blk.trim();
    return b.startsWith('## ') ? <h2 key={i}>{b.slice(3)}</h2> : <p key={i}>{b}</p>;
  });
}

export default async function Post({ params }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  return (
    <>
      <PageHero title={p.title} sub={p.published_at ? dateLong(p.published_at) : undefined} crumbs={[['Journal', '/blog']]} />
      <article className="section"><div className="wrap">
        {p.cover_url && <img src={p.cover_url} alt="" className="media" style={{ marginBottom: '2.5rem', maxWidth: 900, marginInline: 'auto', aspectRatio: '16 / 9' }} />}
        <div className="prose"><Body text={p.body} /><p><Link href="/blog">Back to the journal</Link></p></div>
      </div></article>
      <CtaBand />
    </>
  );
}
