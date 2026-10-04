// The admin's photo when one is uploaded, otherwise whatever fallback the page provides.
export default function Media({ src, alt, fallback = null }) {
  return src ? <img className="media" src={src} alt={alt} loading="lazy" /> : fallback;
}
