'use client';
import { useState } from 'react';

// Plain share links (no tracking scripts) plus copy-link.
export default function ShareLinks({ url, title }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const links = [
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['X', `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ['WhatsApp', `https://wa.me/?text=${t}%20${u}`],
    ['Email', `mailto:?subject=${t}&body=${u}`],
  ];
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.prompt('Copy this link', url); }
  }
  return (
    <div className="share-row" aria-label="Share this article">
      <b>Share</b>
      {links.map(([l, h]) => <a key={l} href={h} target={l === 'Email' ? undefined : '_blank'} rel="noopener noreferrer">{l}</a>)}
      <button type="button" onClick={copy}>{copied ? 'Link copied' : 'Copy link'}</button>
    </div>
  );
}
