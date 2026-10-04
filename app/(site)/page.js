import Link from 'next/link';
import HeroVideo from '@/components/HeroVideo';
import DishCard from '@/components/DishCard';
import Icon from '@/components/Icon';
import Media from '@/components/Media';
import HoursCard from '@/components/HoursCard';
import ReviewCards from '@/components/ReviewCards';
import CtaBand from '@/components/CtaBand';
import InfoList, { MapEmbed, directionsUrl } from '@/components/InfoList';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import { telHref } from '@/lib/format';

export const metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const sb = await createClient();
  const s = await getSettings();
  const [{ data: cats }, { data: items }, { data: reviews }, { data: gallery }] = await Promise.all([
    sb.from('menu_categories').select('id,slug').eq('visible', true),
    sb.from('menu_items').select('*').eq('featured', true).eq('available', true).order('sort_order').limit(6),
    sb.from('reviews').select('*').order('created_at', { ascending: false }).limit(3),
    sb.from('gallery_items').select('*').eq('media_type', 'image').order('sort_order').order('created_at', { ascending: false }).limit(6),
  ]);
  const slugOf = Object.fromEntries((cats || []).map((c) => [c.id, c.slug]));
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';

  const ld = {
    '@context': 'https://schema.org', '@type': 'Restaurant',
    name: s.business_name, servesCuisine: ['Nepalese', 'Indian'], telephone: s.phone, email: s.email || undefined,
    address: { '@type': 'PostalAddress', streetAddress: '115 Wonder World Drive', addressLocality: 'San Marcos', addressRegion: 'TX', postalCode: '78666', addressCountry: 'US' },
    openingHours: 'Mo-Sa 12:00-21:00', url: site, hasMenu: `${site}/menu`, acceptsReservations: !!s.reservations_enabled,
    sameAs: [s.instagram_url, s.facebook_url].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="hero">
        {s.hero_video_url ? <HeroVideo src={s.hero_video_url} /> : s.hero_image_url ? <img className="hero-video" src={s.hero_image_url} alt="" /> : null}
        {(s.hero_video_url || s.hero_image_url) && <div className="hero-shade" />}
        <div className="hero-main">
          <div className="wrap hero-content">
            <h1>{s.hero_title}</h1>
            {s.hero_subtitle && <p className="lede">{s.hero_subtitle}</p>}
            <div className="actions">
              <Link href="/menu" className="btn gold">Order online</Link>
              {s.reservations_enabled && <Link href="/reservations" className="btn line">Reserve a table</Link>}
            </div>
          </div>
        </div>
        <div className="info-strip">
          <div className="wrap">
            <div><small>Hours</small>{s.hours.split('\n')[0]}</div>
            <div><small>Address</small>{s.address.replace(/\n/g, ', ')}</div>
            <div><small>Phone</small><a href={telHref(s.phone)}>{s.phone}</a></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <div className="sec-head"><h2>Cooked the way we grew up eating it</h2></div>
            <p className="lead">{s.story}</p>
            <div className="btn-row"><Link href="/about" className="btn rust">Our story</Link><Link href="/menu" className="btn line">See the menu</Link></div>
          </div>
          <Media src={s.about_image_url} alt="Inside the restaurant" fallback={<HoursCard s={s} />} />
        </div>
      </section>

      {items?.length > 0 && (
        <section className="section soft">
          <div className="wrap">
            <div className="sec-head sec-row"><h2>Signature dishes</h2><Link href="/menu" className="btn line sm">Full menu</Link></div>
            <div className="dish-grid" style={{ marginTop: 0 }}>
              {items.slice(0, 6).map((i) => <DishCard key={i.id} item={i} slug={slugOf[i.category_id]} canOrder={s.accepting_orders} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="sec-head center"><h2>Enjoy it your way</h2><p>Eat in, order ahead, or let us cook for your next event.</p></div>
          <div className="cards c3">
            <div className="card option"><span className="icon-badge"><Icon name="bag" /></span><h3>Order online</h3><p>Choose your dishes, pick a time, and pay when you collect. No account needed.</p><Link href="/order" className="btn rust sm">Order for pickup</Link></div>
            {s.reservations_enabled && <div className="card option"><span className="icon-badge"><Icon name="calendar" /></span><h3>Reserve a table</h3><p>Book a table for dinner or a private event. We confirm by phone or email.</p><Link href="/reservations" className="btn rust sm">Reserve</Link></div>}
            {s.catering_enabled && <div className="card option"><span className="icon-badge"><Icon name="truck" /></span><h3>Catering</h3><p>Parties, offices and celebrations. Tell us the date and headcount for a quote.</p><Link href="/catering" className="btn rust sm">Request a quote</Link></div>}
          </div>
        </div>
      </section>

      {reviews?.length > 0 && (
        <section className="section soft">
          <div className="wrap">
            <div className="sec-head sec-row"><h2>What guests say</h2><Link href="/reviews" className="btn line sm">All reviews</Link></div>
            <ReviewCards reviews={reviews} />
          </div>
        </section>
      )}

      {gallery?.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head sec-row"><h2>From our kitchen</h2><Link href="/gallery" className="btn line sm">Gallery</Link></div>
            <div className="gallery">
              {gallery.map((g) => <Link href="/gallery" key={g.id} className="g-item" aria-label={g.caption || 'Open gallery'}><img src={g.url} alt={g.caption || ''} loading="lazy" /></Link>)}
            </div>
            {(s.instagram_url || s.facebook_url) && (
              <div className="btn-row" style={{ marginTop: '1.5rem' }}>
                {s.instagram_url && <a className="btn line sm" href={s.instagram_url} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>}
                {s.facebook_url && <a className="btn line sm" href={s.facebook_url} target="_blank" rel="noopener noreferrer">Follow on Facebook</a>}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section soft">
        <div className="wrap split">
          <div>
            <div className="sec-head"><h2>Visit us</h2></div>
            <InfoList s={s} />
            <div className="btn-row" style={{ marginTop: '1.5rem' }}>
              <a className="btn rust" href={directionsUrl(s)} target="_blank" rel="noopener noreferrer">Get directions</a>
              <a className="btn line" href={telHref(s.phone)}>Call us</a>
            </div>
          </div>
          <MapEmbed s={s} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
