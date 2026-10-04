// A real photo when the admin has uploaded one, otherwise a clean branded panel.
export default function Media({ src, alt }) {
  if (src) return <img className="media" src={src} alt={alt} loading="lazy" />;
  return (
    <div className="media-ph" role="img" aria-label={alt}>
      <svg viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 160V104L110 60L200 110L340 28L470 104L590 50L710 118L850 34L980 102L1100 64L1200 112V160Z" fill="#9a4f26" />
        <path d="M0 104L110 60L200 110L340 28L470 104L590 50L710 118L850 34L980 102L1100 64L1200 112" fill="none" stroke="#ffd21a" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
