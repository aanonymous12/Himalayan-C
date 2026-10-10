import Link from 'next/link';
import { dateLong } from '@/lib/format';
import { readingMinutes } from '@/lib/blog';

export default function PostCard({ p, featured = false }) {
  return (
    <Link href={`/blog/${p.slug}`} className={`post-card${featured ? ' featured' : ''}`}>
      {p.cover_url ? <img src={p.cover_url} alt={p.cover_alt || ''} loading={featured ? 'eager' : 'lazy'} /> : <div className="ph" aria-hidden="true" />}
      <div className="pc-body">
        <span className="pc-meta">{p.published_at && <time dateTime={p.published_at}>{dateLong(p.published_at)}</time>}{p.body && <> &middot; {readingMinutes(p.body)} min read</>}</span>
        <h3>{p.title}</h3>
        {p.excerpt && <p>{p.excerpt}</p>}
        <span className="pc-more">Read article &rarr;</span>
      </div>
    </Link>
  );
}
