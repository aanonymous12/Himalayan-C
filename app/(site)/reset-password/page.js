import { redirect } from 'next/navigation';
import PasswordForm from '@/components/PasswordForm';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Reset password', robots: { index: false } };

export default async function ResetPassword() {
  const { user } = await getSession();
  if (!user) redirect('/login?error=link');
  return <section className="auth-page"><div className="auth-card"><PasswordForm heading="Choose a new password" redirectTo="/account" /></div></section>;
}
