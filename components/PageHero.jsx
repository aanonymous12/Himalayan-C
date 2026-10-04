import Link from 'next/link';

// Banner for inner pages, with visible breadcrumbs and BreadcrumbList schema for search engines.
export default function PageHero({ title, sub, crumbs = [] }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const trail = [['Home', '/'], ...crumbs.map((c) => (Array.isArray(c) ? c : [c])), [title]];
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t[0], ...(t[1] ? { item: `${site}${t[1]}` } : {}) })),
  };
  return (
    <header className="page-hero">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          {trail.map((t, i) => (
            <span key={i}>{t[1] && i < trail.length - 1 ? <Link href={t[1]}>{t[0]}</Link> : <span aria-current="page">{t[0]}</span>}{i < trail.length - 1 && ' / '}</span>
          ))}
        </nav>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </header>
  );
}
