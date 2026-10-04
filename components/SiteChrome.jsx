'use client';
import { usePathname } from 'next/navigation';

// Public pages get the header, footer and cart. The admin dashboard has its own layout, so it gets none of them.
export default function SiteChrome({ header, footer, drawer, children }) {
  const path = usePathname();
  if (path.startsWith('/admin')) return children;
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
