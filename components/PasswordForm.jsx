'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PasswordForm({ heading = 'Change password', redirectTo }) {
  const router = useRouter();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const pw = String(f.get('password') || '');
    if (pw.length < 8) return setMsg({ type: 'error', text: 'Please use at least 8 characters.' });
    if (pw !== f.get('confirm')) return setMsg({ type: 'error', text: 'The two passwords do not match.' });
    setBusy(true); setMsg(null);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ type: 'error', text: error.message });
    form.reset();
    setMsg({ type: 'ok', text: 'Password updated.' });
    if (redirectTo) { router.push(redirectTo); router.refresh(); }
  }

  return (
    <form onSubmit={submit}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{heading}</h2>
      {msg && <div className={msg.type} role={msg.type === 'error' ? 'alert' : 'status'}>{msg.text}</div>}
      <div className="field"><label htmlFor="pw1">New password</label><input id="pw1" name="password" type="password" required autoComplete="new-password" /></div>
      <div className="field"><label htmlFor="pw2">Confirm new password</label><input id="pw2" name="confirm" type="password" required autoComplete="new-password" /></div>
      <button className="btn rust" disabled={busy}>{busy ? 'Saving...' : 'Update password'}</button>
    </form>
  );
}
