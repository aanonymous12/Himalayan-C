import Link from 'next/link';
import Nav from './Nav';
import { getSettings } from '@/lib/settings';

export default async function Header() {
  const s = await getSettings();
  return (
    <>
      {s.announcement && <div className="notice">{s.announcement}</div>}
      <header className="site-head">
        <div className="wrap">
          <Link href="/" className="brand"><b>Himalayan</b><span>NEPALESE &amp; INDIAN CUISINE</span></Link>
          <Nav />
        </div>
      </header>
    </>
  );
}
