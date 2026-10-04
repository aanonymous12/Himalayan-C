import { stars } from '@/lib/format';

export default function ReviewCards({ reviews }) {
  return (
    <div className="cards c3">
      {reviews.map((r) => (
        <figure className="card review" key={r.id} style={{ margin: 0 }}>
          <span className="stars" role="img" aria-label={`${r.rating} out of 5 stars`}>{stars(r.rating)}</span>
          <blockquote style={{ margin: 0 }}><p>{r.body}</p></blockquote>
          <figcaption className="who">{r.author} <span className="src">{r.source === 'google' ? 'via Google' : ''}</span></figcaption>
        </figure>
      ))}
    </div>
  );
}
