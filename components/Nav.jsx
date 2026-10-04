'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import CartLink from './CartLink';
import SignOut from './SignOut';
import Icon from './Icon';

const LINKS = [
  ['/', 'Home'], ['/menu', 'Menu'], ['/about', 'About Us'], ['/gallery', 'Gallery'],
  ['/reviews', 'Reviews'], ['/reservations', 'Reservations'], ['/contact', 'Contact Us'],
];

function Account({ user, isAdmin }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  if (!user) return <Link href="/login" className="acct-login"><Icon name="user" size={20} /><span>Log in</span></Link>;
  return (
    <div className="acct" ref={ref}>
      <button className="acct-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="user" size={20} /><span>Account</span></button>
      {open && (
        <div className="acct-menu" role="menu" onClick={() => setOpen(false)}>
          <div className="acct-email">{user.email}</div>
          {isAdmin && <Link href="/admin" role="menuitem"><b>Admin dashboard</b></Link>}
          <Link href="/account" role="menuitem">My orders and reservations</Link>
          <SignOut />
        </div>
      )}
    </div>
  );
}

export default function Nav({ user, isAdmin, reservations = true }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  const here = (h) => (h === '/' ? path === '/' : path === h || path.startsWith(h + '/'));
  const links = LINKS.filter(([h]) => reservations || h !== '/reservations');

  return (
    <>
      <nav id="site-nav" className={`nav${open ? ' open' : ''}`} aria-label="Main">
        {links.map(([h, label]) => <Link key={h} href={h} aria-current={here(h) ? 'page' : undefined}>{label}</Link>)}
        <div className="nav-mobile">
          {user ? (<>{isAdmin && <Link href="/admin"><b>Admin dashboard</b></Link>}<Link href="/account">My account</Link><SignOut /></>) : <Link href="/login">Log in</Link>}
          <Link href="/menu" className="btn rust" style={{ marginTop: '.75rem' }}>Order Now</Link>
        </div>
      </nav>
      <div className="head-actions">
        <span className="only-desktop"><Account user={user} isAdmin={isAdmin} /></span>
        <CartLink />
        <Link href="/menu" className="btn rust sm only-desktop">Order Now</Link>
        <button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
          <i /><i /><i />
        </button>
      </div>
    </>
  );
}
