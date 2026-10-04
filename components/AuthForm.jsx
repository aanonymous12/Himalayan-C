'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const friendly = (m = '') =>
  /invalid login/i.test(m) ? 'That email or password is not right.'
  : /not confirmed/i.test(m) ? 'Please confirm your email first. Check your inbox for the link.'
  : /already registered/i.test(m) ? 'An account with that email already exists. Try logging in.'
  : /rate limit|too many/i.test(m) ? 'Too many attempts. Please wait a minute and try again.'
  : m || 'Something went wrong. Please try again.';

// One login form for everyone. After signing in, admins go to the dashboard and customers to their account.
export default function AuthForm({ next, notice }) {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [msg, setMsg] = useState(notice ? { type: 'error', text: notice } : null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const f = new FormData(e.currentTarget);
    const sb = createClient();
    const email = String(f.get('email') || '').trim();
    const password = String(f.get('password') || '');
    try {
      if (mode === 'forgot') {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/reset-password` });
        if (error) throw error;
        return setMsg({ type: 'ok', text: 'If an account exists for that email, a reset link is on its way. Check your inbox.' });
      }
      let user;
      if (mode === 'signup') {
        if (password.length < 8) throw new Error('Please choose a password with at least 8 characters.');
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { data: { full_name: String(f.get('name') || ''), phone: String(f.get('phone') || '') }, emailRedirectTo: `${location.origin}/auth/callback?next=/account` },
        });
        if (error) throw error;
        if (!data.session) return setMsg({ type: 'ok', text: 'Almost done. Check your email and click the link to confirm your account, then log in.' });
        user = data.user;
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        user = data.user;
      }
      let dest = next;
      if (!dest) {
        const { data: p } = await sb.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
        dest = p?.is_admin ? '/admin' : '/account';
      }
      router.push(dest);
      router.refresh();
    } catch (err) {
      setMsg({ type: 'error', text: friendly(err.message) });
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password';
  return (
    <form onSubmit={submit} noValidate={false}>
      <h1 className="auth-title">{title}</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        {mode === 'login' ? 'Log in to see your orders and reservations.' : mode === 'signup' ? 'Save your details and track your orders. Guest checkout is always available.' : 'Enter your email and we will send you a link.'}
      </p>
      {msg && <div className={msg.type} role={msg.type === 'error' ? 'alert' : 'status'}>{msg.text}</div>}
      {mode === 'signup' && (<>
        <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      </>)}
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      {mode !== 'forgot' && (
        <div className="field"><label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          {mode === 'signup' && <span className="hint">At least 8 characters.</span>}
        </div>
      )}
      <button className="btn rust" style={{ width: '100%' }} disabled={busy}>
        {busy ? 'One moment...' : mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
      </button>
      <div className="auth-links">
        {mode === 'login' && <><button type="button" onClick={() => { setMode('forgot'); setMsg(null); }}>Forgot password?</button><button type="button" onClick={() => { setMode('signup'); setMsg(null); }}>Create an account</button></>}
        {mode !== 'login' && <button type="button" onClick={() => { setMode('login'); setMsg(null); }}>Back to log in</button>}
      </div>
    </form>
  );
}
