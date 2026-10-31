// The public address of the website, used for share cards (Open Graph), the sitemap and links in emails.
// Uses NEXT_PUBLIC_SITE_URL when set (https:// is added if you forgot it), otherwise the address Vercel gives
// the project, so share links never point at localhost.
export function siteUrl() {
  let e = String(process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  if (e && !/^https?:\/\//i.test(e)) e = `https://${e}`;
  if (e) return e;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
