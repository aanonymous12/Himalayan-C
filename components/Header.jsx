import Link from 'next/link';
import Nav from './Nav';
import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

export default async function Header() {
  const [{ user, isAdmin }, s] = await Promise.all([getSession(), getSettings()]);
  return (
    <>
      {s.announcement && <div className="notice">{s.announcement}</div>}
      <header className="site-head">
        <div className="wrap">
          <Link href="/" className="brand"><b>Himalayan</b><span>NEPALESE &amp; INDIAN CUISINE</span></Link>
          <Nav user={user ? { email: user.email } : null} isAdmin={isAdmin} reservations={s.reservations_enabled} />
        </div>
      </header>
    </>
  );
}
