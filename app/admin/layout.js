import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

// Admin is the same login as everyone else. Only accounts marked as admin get past this point.
export default async function AdminLayout({ children }) {
  const { user } = await requireAdmin();
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
