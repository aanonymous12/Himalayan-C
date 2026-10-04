import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ReviewCards from '@/components/ReviewCards';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import { stars } from '@/lib/format';

export const metadata = {
  title: 'Reviews',
  description: 'What guests say about Himalayan Nepalese & Indian Cuisine in San Marcos, TX.',
  alternates: { canonical: '/reviews' },
};

export default async function Reviews() {
  const sb = await createClient();
  const s = await getSettings();
  const { data } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
  const reviews = data ?? [];
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  const ld = reviews.length ? {
    '@context': 'https://schema.org', '@type': 'Restaurant', name: s.business_name,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length },
  } : null;

  return (
    <>
      <PageHero title="Guest reviews" sub="Kind words from the people we cook for." />
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <section className="section">
        <div className="wrap">
          {reviews.length > 0 ? (
            <>
              <div className="score"><b>{avg.toFixed(1)}</b><div><span className="stars">{stars(Math.round(avg))}</span><div className="muted">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div></div></div>
              <ReviewCards reviews={reviews} />
            </>
          ) : <p className="lead">Reviews will appear here soon.</p>}
          <div className="btn-row" style={{ marginTop: '2.5rem' }}>
            {s.google_review_url && <a className="btn rust" href={s.google_review_url} target="_blank" rel="noopener noreferrer">Review us on Google</a>}
            <Link className="btn line" href="/review">Share private feedback</Link>
          </div>
        </div>
      </section>
    </>
  );
}
