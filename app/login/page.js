import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Log in', robots: { index: false } };

export default async function Login({ searchParams }) {
  const { next } = await searchParams;
  const safe = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/account';
  return (
    <div className="wrap auth">
      <h1 style={{ marginBottom: '.5rem' }}>Log in</h1>
      <p className="muted">An account is optional. It saves your details at checkout and keeps your order history.</p>
      <AuthForm next={safe} />
    </div>
  );
}
