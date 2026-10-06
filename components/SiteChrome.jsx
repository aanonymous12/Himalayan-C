'use client';
import { usePathname } from 'next/navigation';

// Public pages get the header, footer and cart. The dashboard and the business-card page have their own look.
export default function SiteChrome({ header, footer, drawer, children }) {
  const path = usePathname();
  if (path.startsWith('/admin') || path === '/connect') return children;
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {header}
      <main id="main">{children}</main>
      {footer}
      {drawer}
    </>
  );
}
