'use client';
import { createContext, useContext, useEffect, useRef, useState, useTransition } from 'react';

const Pending = createContext(false);

export function SubmitButton({ children, className = 'btn', pendingText = 'Saving...' }) {
  const pending = useContext(Pending);
  return <button type="submit" className={className} disabled={pending}>{pending ? pendingText : children}</button>;
}

// Calls a server action and shows its result inline. Errors never crash the page,
// and fields keep what the visitor typed when something needs fixing.
export default function ActionForm({ action, children, className, resetOnSuccess = false }) {
  const [state, setState] = useState(null);
  const [pending, start] = useTransition();
  const msg = useRef(null);
  const [gen, setGen] = useState(0);

  useEffect(() => { if (state) msg.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [state]);

  function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState(null);
    start(async () => {
      let r;
      try { r = await action(null, fd); } catch { r = { error: 'Something went wrong. Please try again.' }; }
      setState(r);
      if (r?.ok && resetOnSuccess) setGen((g) => g + 1); // remount fields, including photo pickers
    });
  }

  return (
    <Pending.Provider value={pending}>
      <form onSubmit={onSubmit} className={className}>
        <div key={gen} style={{ display: 'contents' }}>{children}</div>
        <div ref={msg} style={{ marginTop: state ? '1rem' : 0 }}>
          {state?.error && <div className="error" role="alert">{state.error}</div>}
          {state?.ok && state.message && <div className="ok" role="status">{state.message}</div>}
        </div>
      </form>
    </Pending.Provider>
  );
}
