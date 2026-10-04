import Link from 'next/link';
import Icon from './Icon';
import { getSettings } from '@/lib/settings';
import { telHref } from '@/lib/format';

export default async function Footer() {
  const s = await getSettings();
  return (
    <footer>
      <div className="wrap">
        <div>
          <h3>{s.business_name}</h3>
          <p>Nepali and Indian cooking, made fresh daily in San Marcos, Texas.</p>
          <div className="social" style={{ marginTop: '1rem' }}>
            {s.instagram_url && <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" size={20} /></a>}
            {s.facebook_url && <a href={s.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="facebook" size={20} /></a>}
          </div>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>
            <li><Link href="/menu">Menu</Link></li><li><Link href="/order">Order online</Link></li>
            <li><Link href="/reservations">Reservations</Link></li><li><Link href="/catering">Catering</Link></li>
            <li><Link href="/gallery">Gallery</Link></li><li><Link href="/blog">Journal</Link></li>
          </ul>
        </div>
        <div>
          <h3>Visit</h3>
          <p className="pre">{s.address}</p>
          <p className="pre">{s.hours}</p>
        </div>
        <div>
          <h3>Contact</h3>
          <p><a href={telHref(s.phone)}>{s.phone}</a></p>
          {s.email && <p><a href={`mailto:${s.email}`}>{s.email}</a></p>}
          <p><Link href="/contact">Send a message</Link></p>
          <p><Link href="/review">Leave a review</Link></p>
        </div>
        <div className="legal">&copy; {new Date().getFullYear()} {s.business_name}. Payment is taken at the restaurant.</div>
      </div>
    </footer>
  );
}
