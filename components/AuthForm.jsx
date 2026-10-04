'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthForm({ next }) {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const f = new FormData(e.target);
    const sb = createClient();
    const email = f.get('email'), password = f.get('password');
    const res = mode === 'login'
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password, options: { data: { full_name: f.get('name'), phone: f.get('phone') } } });
    setBusy(false);
    if (res.error) return setMsg({ type: 'error', text: res.error.message });
    if (mode === 'signup' && !res.data.session) return setMsg({ type: 'ok', text: 'Check your email and click the link to confirm your account, then log in.' });
    router.push(next); router.refresh();
  }

  return (
    <form onSubmit={submit}>
      {msg && <div className={msg.type}>{msg.text}</div>}
      {mode === 'signup' && (<>
        <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      </>)}
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div>
      <button className="btn" disabled={busy}>{busy ? 'One moment...' : mode === 'login' ? 'Log in' : 'Create account'}</button>
      <p style={{ marginTop: '1rem' }}>
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); setMsg(null); }}>
          {mode === 'login' ? 'Create an account' : 'Log in'}
        </a>
      </p>
    </form>
  );
}
