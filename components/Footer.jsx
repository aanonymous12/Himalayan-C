import Link from 'next/link';
import Icon from './Icon';
import { getSettings } from '@/lib/settings';
import { telHref } from '@/lib/format';

const QUICK = [['home', 'Home'], ['about', 'About Us'], ['menu', 'Menu'], ['gallery', 'Gallery'], ['reservation', 'Reservation'], ['testimonials', 'Testimonial'], ['contact', 'Contact Us']];

export default async function Footer() {
  const s = await getSettings();
  return (
    <footer>
      <div className="wrap">
        <div>
          <Link href="/" className="foot-brand">Himalayan</Link>
          <p>Nepali and Indian cooking, made fresh daily in San Marcos, Texas. Eat in, order ahead, or let us cater your next event.</p>
          <div className="social" style={{ marginTop: '1rem' }}>
            {s.instagram_url && <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" size={20} /></a>}
            {s.facebook_url && <a href={s.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="facebook" size={20} /></a>}
          </div>
        </div>
        <div>
          <h3>Quick links</h3>
          <ul>{QUICK.map(([id, l]) => <li key={id}><Link href={`/#${id}`}>{l}</Link></li>)}<li><Link href="/buffet">Buffet</Link></li><li><Link href="/blog">Journal</Link></li></ul>
        </div>
        <div>
          <h3>Opening hours</h3>
          <p className="pre">{s.hours}</p>
          <p style={{ marginTop: '1rem' }}><Link href="/menu" className="btn gold sm">Order Now</Link></p>
        </div>
        <div>
          <h3>Find us</h3>
          <p className="pre">{s.address}</p>
          <p><a href={telHref(s.phone)}>{s.phone}</a></p>
          {s.email && <p><a href={`mailto:${s.email}`}>{s.email}</a></p>}
          <p><Link href="/review">Leave a review</Link></p>
        </div>
        <div className="legal">
          <span>&copy; {new Date().getFullYear()} {s.business_name}. All rights reserved.</span>
          <span>Payment is taken at the restaurant.</span>
        </div>
      </div>
    </footer>
  );
}
