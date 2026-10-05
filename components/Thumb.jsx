// Small dish picture for carts and order summaries.
export default function Thumb({ src, name }) {
  if (src) return <img className="thumb-sm" src={src} alt="" loading="lazy" />;
  return (
    <span className="thumb-sm" aria-hidden="true" title={undefined}>
      <svg width="26" height="26" viewBox="0 0 48 48" fill="none" stroke="#9a4f26" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round"><path d="M6 24h36a18 18 0 0 1-36 0z" /><path d="M18 12c-2 3 2 4 0 7M26 10c-2 3 2 4 0 7M34 12c-2 3 2 4 0 7" /></svg>
    </span>
  );
}
