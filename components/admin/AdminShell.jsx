'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Icon from '../Icon';
import SignOut from '../SignOut';

const NAV = [
  ['Overview', [['/admin', 'Dashboard', 'grid'], ['/admin/orders', 'Orders', 'bag'], ['/admin/reservations', 'Reservations', 'calendar'], ['/admin/messages', 'Inbox', 'inbox']]],
  ['Website', [['/admin/menu', 'Menu', 'utensils'], ['/admin/promos', 'Promo codes', 'tag'], ['/admin/gallery', 'Gallery', 'image'], ['/admin/buffet', 'Buffet', 'flame'], ['/admin/reviews', 'Testimonials', 'star'], ['/admin/blog', 'Blog', 'pen']]],
  ['Configuration', [['/admin/connect', 'Business card', 'card'], ['/admin/settings', 'Settings', 'gear']]],
];

export default function AdminShell({ email, children }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  const here = (h) => (h === '/admin' ? path === '/admin' : path.startsWith(h));
  const current = NAV.flatMap(([, l]) => l).find(([h]) => here(h))?.[1] || 'Admin';

  return (
    <div className="adm">
      {open && <div className="drawer-ov" onClick={() => setOpen(false)} />}
      <aside className={`adm-side${open ? ' open' : ''}`} aria-label="Admin navigation">
        <Link href="/admin" className="adm-brand"><b>Himalayan</b><span>Admin</span></Link>
        <nav className="adm-nav">
          {NAV.map(([group, links]) => (
            <div key={group}>
              <div className="grp">{group}</div>
              {links.map(([h, label, icon]) => <Link key={h} href={h} aria-current={here(h) ? 'page' : undefined}><Icon name={icon} size={19} />{label}</Link>)}
            </div>
          ))}
        </nav>
      </aside>
      <div className="adm-body">
        <header className="adm-top">
          <div className="row" style={{ gap: '.75rem' }}>
            <button className="icon-btn adm-burger" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}><Icon name="grid" size={20} /></button>
            <b className="adm-title">{current}</b>
          </div>
          <div className="row" style={{ gap: '1rem' }}>
            <Link href="/" target="_blank" className="adm-link"><Icon name="external" size={17} /><span>View website</span></Link>
            <span className="adm-user">{email}</span>
            <Link href="/admin/settings#password" className="adm-link"><span>Password</span></Link>
            <SignOut className="adm-link adm-out" />
          </div>
        </header>
        <main className="adm-main"><div className="adm-content">{children}</div></main>
      </div>
    </div>
  );
}
