'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CartLink from './CartLink';

// Every item jumps to a section of the home page. From other pages the links go back to the home page section.
const LINKS = [
  ['home', 'Home'], ['about', 'About Us'], ['menu', 'Menu'], ['gallery', 'Gallery'],
  ['reservation', 'Reservation'], ['testimonials', 'Testimonial'], ['blog', 'Blog'], ['contact', 'Contact Us'],
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
    if (path !== '/') return setActive('');
    const els = LINKS.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  return (
    <>
      <nav id="site-nav" className={`nav${open ? ' open' : ''}`} aria-label="Main">
        {LINKS.map(([id, label]) => (
          <Link key={id} href={`/#${id}`} aria-current={active === id ? 'true' : undefined} onClick={() => setOpen(false)}>{label}</Link>
        ))}
        <div className="nav-mobile"><Link href="/menu" className="btn rust" style={{ marginTop: '.75rem' }}>Order Now</Link></div>
      </nav>
      <div className="head-actions">
        <CartLink />
        <Link href="/menu" className="btn rust sm only-desktop">Order Now</Link>
        <button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
          <i /><i /><i />
        </button>
      </div>
    </>
  );
}
