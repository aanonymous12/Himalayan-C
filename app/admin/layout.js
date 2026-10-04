import AdminShell from '@/components/admin/AdminShell';
import { getAdmin } from '@/lib/auth';

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

// Signed-out visitors see the login at /admin. Signed-in administrators see the dashboard shell.
export default async function AdminLayout({ children }) {
  const a = await getAdmin();
  if (!a) return <>{children}</>;
  return <AdminShell email={a.user.email}>{children}</AdminShell>;
}
