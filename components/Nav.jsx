'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CartLink from './CartLink';
import SignOut from './SignOut';

const LINKS = [
  ['/menu', 'Menu'], ['/order', 'Order online'], ['/reservations', 'Reservations'],
  ['/gallery', 'Gallery'], ['/about', 'About'], ['/reviews', 'Reviews'], ['/contact', 'Contact'],
];

export default function Nav({ user, isAdmin }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  const here = (h) => path === h || path.startsWith(h + '/');

  return (
    <>
      <nav id="site-nav" className={`nav${open ? ' open' : ''}`} aria-label="Main">
        {LINKS.map(([h, label]) => <Link key={h} href={h} aria-current={here(h) ? 'page' : undefined}>{label}</Link>)}
        {isAdmin && <Link href="/admin">Admin</Link>}
        {user ? (<><Link href="/account">My account</Link><SignOut /></>) : <Link href="/login">Log in</Link>}
      </nav>
      <div className="head-actions">
        <CartLink />
        <button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
          <i /><i /><i />
        </button>
      </div>
    </>
  );
}
