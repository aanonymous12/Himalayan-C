import AdminShell from '@/components/admin/AdminShell';
import AutoRefresh from '@/components/AutoRefresh';
import { getAdmin } from '@/lib/auth';

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

// Signed-out visitors see the login at /admin. Signed-in administrators see the dashboard shell
// with a "+N" badge on each section that has something new waiting.
export default async function AdminLayout({ children }) {
  const a = await getAdmin();
  if (!a) return <>{children}</>;
  const { sb } = a;
  const n = async (table, col, val, op = 'eq') => {
    try { return (await sb.from(table).select('id', { count: 'exact', head: true })[op](col, val)).count || 0; } catch { return 0; }
  };
  const [orders, reservations, messages, feedback, buffet] = await Promise.all([
    n('orders', 'status', 'new'), n('reservations', 'status', 'pending'),
    n('messages', 'handled', false), n('feedback', 'resolved', false), n('buffet_feedback', 'is_read', false),
  ]);
  const badges = { '/admin/orders': orders, '/admin/reservations': reservations, '/admin/messages': messages + feedback, '/admin/buffet': buffet };
  return <AdminShell email={a.user.email} badges={badges}><AutoRefresh seconds={30} />{children}</AdminShell>;
}
