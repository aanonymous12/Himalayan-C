'use client';
import { useState } from 'react';
import Icon from './Icon';

export default function ShareButton({ title, text }) {
  const [msg, setMsg] = useState('');
  async function go() {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else { await navigator.clipboard.writeText(url); setMsg('Link copied'); setTimeout(() => setMsg(''), 2200); }
    } catch { /* the visitor closed the share sheet */ }
  }
  return <button type="button" className="cc-btn" onClick={go}><Icon name="share" size={20} /><span>{msg || 'Share'}</span></button>;
}
