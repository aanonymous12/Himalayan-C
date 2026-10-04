import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

const LINKS = [['/admin', 'Dashboard'], ['/admin/orders', 'Orders'], ['/admin/reservations', 'Reservations'], ['/admin/messages', 'Inbox'], ['/admin/menu', 'Menu'], ['/admin/gallery', 'Gallery'], ['/admin/reviews', 'Reviews'], ['/admin/blog', 'Journal'], ['/admin/settings', 'Settings']];

export default async function AdminLayout({ children }) {
  await requireAdmin();
  return (
    <div className="wrap admin">
      <nav className="admin-nav" aria-label="Admin">
        {LINKS.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}
      </nav>
      <div>{children}</div>
    </div>
  );
}
