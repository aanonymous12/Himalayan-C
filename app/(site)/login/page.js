import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Log in', robots: { index: false } };

export default async function Login({ searchParams }) {
  const { next, error } = await searchParams;
  const safe = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null;
  const { user, isAdmin } = await getSession();
  if (user) redirect(isAdmin ? (safe || '/admin') : (safe && !safe.startsWith('/admin') ? safe : '/account'));
  return (
    <section className="auth-page">
      <div className="auth-card">
        <AuthForm next={safe} notice={error === 'link' ? 'That link has expired or was already used. Please try again.' : null} />
      </div>
    </section>
  );
}
