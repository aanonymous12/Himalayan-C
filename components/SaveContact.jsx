'use client';
import { useState } from 'react';
import Icon from '@/components/Icon';

// "Save contact" button.
// Android and desktop: plain link to the .vcf file.
// iPhone Safari: plain link too; Safari opens the contact card (save option is at the bottom of it).
// iPhone Chrome / Instagram / Facebook and other non-Safari browsers: these often do nothing with a contact
// file, so we hand the file to Safari first. If the phone refuses the hand-off we fall back to the file itself
// and show how to open the page in Safari.
export default function SaveContact({ href }) {
  const [tip, setTip] = useState('');
  function onClick(e) {
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!ios) return;
    const safari = /Safari\//.test(ua) && /Version\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|DuckDuckGo|FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|TikTok|musical_ly|MicroMessenger|LinkedInApp|Pinterest|Twitter/.test(ua);
    if (safari) { setTip('scroll'); return; }

    e.preventDefault();
    setTip('safari');
    const file = new URL(href, window.location.href);
    let left = false;
    const gone = () => { if (document.hidden) left = true; };
    document.addEventListener('visibilitychange', gone);
    window.addEventListener('pagehide', gone);
    // Hand off to Safari (the x-safari- address opens the same file there).
    window.location.href = `x-safari-${file.href}`;
    setTimeout(() => {
      document.removeEventListener('visibilitychange', gone);
      window.removeEventListener('pagehide', gone);
      if (left || document.hidden) return;
      // Hand-off was blocked: let this browser try the file as a download.
      setTip('open');
      window.location.href = `${file.pathname}?dl=1`;
    }, 1600);
  }
  return (
    <>
      <a href={href} onClick={onClick} className="cc-btn primary"><Icon name="user" size={20} /><span>Save contact</span></a>
      {tip === 'scroll' && <p className="cc-tip">On iPhone, scroll down in the card that opens and tap <b>Create New Contact</b>.</p>}
      {tip === 'safari' && <p className="cc-tip">Opening in Safari. If it asks, tap <b>Open</b>, then scroll down in the card and tap <b>Create New Contact</b>.</p>}
      {tip === 'open' && <p className="cc-tip">If nothing opened, this browser cannot save contacts on iPhone. Open this page in <b>Safari</b> (Share or the ... menu, then Open in Safari) and tap Save contact again.</p>}
    </>
  );
}
