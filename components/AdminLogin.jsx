'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// The only login on the site. It lives at /admin and nothing on the public site links to it.
export default function AdminLogin() {
  const router = useRouter();
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const f = new FormData(e.currentTarget);
    const sb = createClient();
    const { data, error } = await sb.auth.signInWithPassword({ email: String(f.get('email') || '').trim(), password: String(f.get('password') || '') });
    if (error) { setBusy(false); return setErr(/invalid|credentials/i.test(error.message) ? 'That email or password is not right.' : /rate|too many/i.test(error.message) ? 'Too many attempts. Please wait a minute.' : error.message); }
    const { data: p } = await sb.from('profiles').select('is_admin').eq('id', data.user.id).maybeSingle();
    if (!p?.is_admin) { await sb.auth.signOut(); setBusy(false); return setErr('This account does not have access to the dashboard.'); }
    router.refresh(); // the same address now shows the dashboard
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><b>Himalayan</b><span>Dashboard</span></div>
        <h1 className="auth-title">Sign in</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>Staff access only.</p>
        {err && <div className="error" role="alert">{err}</div>}
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" autoFocus /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
          <button className="btn rust" style={{ width: '100%' }} disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </section>
  );
}
