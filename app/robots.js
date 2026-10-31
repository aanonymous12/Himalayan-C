import { siteUrl } from '@/lib/site';
const site = siteUrl();
// The dashboard is deliberately not listed here: robots.txt is public and would reveal its address.
export default function robots() {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/checkout', '/order/', '/review', '/connect'] }, sitemap: `${site}/sitemap.xml` };
}
