'use client';
import { useState, useTransition } from 'react';

export default function DeleteButton({ action, id, label = 'Delete', confirmText = 'Delete this? This cannot be undone.' }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState(null);
  function go() {
    if (!window.confirm(confirmText)) return;
    const fd = new FormData();
    fd.set('id', id);
    start(async () => {
      try { const r = await action(null, fd); if (r?.error) setErr(r.error); } catch { setErr('Could not delete.'); }
    });
  }
  return (
    <>
      <button type="button" className="btn sm danger" disabled={pending} onClick={go}>{pending ? 'Deleting...' : label}</button>
      {err && <span className="soldout"> {err}</span>}
    </>
  );
}
