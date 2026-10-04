// The dish photo when one is uploaded in Admin > Menu, otherwise a quiet neutral tile.
export default function DishImage({ src, name, className = 'dish-card-img' }) {
  if (src) return <img className={className} src={src} alt={name} loading="lazy" />;
  return (
    <div className={className} role="img" aria-label={`${name}, photo coming soon`} style={{ display: 'grid', placeItems: 'center', background: '#f1e9e2' }}>
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#9a4f26" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 24h36a18 18 0 0 1-36 0z" /><path d="M18 12c-2 3 2 4 0 7M26 10c-2 3 2 4 0 7M34 12c-2 3 2 4 0 7" />
      </svg>
    </div>
  );
}
