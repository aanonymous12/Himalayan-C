import Link from 'next/link';
import HeroVideo from '@/components/HeroVideo';
import DishCard from '@/components/DishCard';
import GalleryGrid from '@/components/GalleryGrid';
import ReviewCards from '@/components/ReviewCards';
import BookingTabs from '@/components/BookingTabs';
import ReservationForm from '@/components/ReservationForm';
import CateringForm from '@/components/CateringForm';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import Icon from '@/components/Icon';
import InfoList, { MapEmbed, directionsUrl } from '@/components/InfoList';
import { submitContact } from '@/app/actions';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import { telHref, timeSlots, todayISO, addDays, stars } from '@/lib/format';

export const metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const sb = await createClient();
  const s = await getSettings();
  const [{ data: cats }, { data: picked }, { data: reviews }, { data: gallery }] = await Promise.all([
    sb.from('menu_categories').select('id,sort_order').eq('visible', true).order('sort_order'),
    sb.from('menu_items').select('*').eq('featured', true).order('sort_order'),
    sb.from('reviews').select('*').order('created_at', { ascending: false }),
    sb.from('gallery_items').select('*').order('sort_order').order('created_at', { ascending: false }).limit(13),
  ]);

  // The menu shown here is whatever the admin ticked "Show on home page" for. Until they pick, show the first few dishes.
  const order = Object.fromEntries((cats || []).map((c, i) => [c.id, i]));
  let dishes = (picked || []).filter((i) => order[i.category_id] !== undefined);
  if (!dishes.length) {
    const { data } = await sb.from('menu_items').select('*').order('sort_order').limit(24);
    dishes = (data || []).filter((i) => order[i.category_id] !== undefined).slice(0, 8);
  }
  dishes.sort((a, b) => order[a.category_id] - order[b.category_id] || a.sort_order - b.sort_order);

  const avg = reviews?.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  const today = todayISO();
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const ld = {
    '@context': 'https://schema.org', '@type': 'Restaurant',
    name: s.business_name, servesCuisine: ['Nepalese', 'Indian'], telephone: s.phone, email: s.email || undefined,
    address: { '@type': 'PostalAddress', streetAddress: '115 Wonder World Drive', addressLocality: 'San Marcos', addressRegion: 'TX', postalCode: '78666', addressCountry: 'US' },
    openingHours: 'Mo-Sa 12:00-21:00', url: site, hasMenu: `${site}/menu`, acceptsReservations: !!s.reservations_enabled,
    sameAs: [s.instagram_url, s.facebook_url].filter(Boolean),
    ...(reviews?.length ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="hero" id="home">
        {s.hero_video_url ? <HeroVideo src={s.hero_video_url} /> : s.hero_image_url ? <img className="hero-video" src={s.hero_image_url} alt="" /> : null}
        {(s.hero_video_url || s.hero_image_url) && <div className="hero-shade" />}
        <div className="hero-main">
          <div className="wrap hero-content">
            <h1>{s.hero_title}</h1>
            {s.hero_subtitle && <p className="lede">{s.hero_subtitle}</p>}
            <div className="actions">
              <Link href="/menu" className="btn gold">Order Now</Link>
              {s.reservations_enabled && <Link href="/#reservation" className="btn line">Reserve a table</Link>}
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

      <section id="about" className="section">
        <div className={`wrap ${s.about_image_url ? 'split' : ''}`} style={s.about_image_url ? undefined : { maxWidth: 820 }}>
          <div>
            <div className="sec-head"><h2>About Us</h2></div>
            <p className="lead">{s.story}</p>
            {s.philosophy && <p>{s.philosophy}</p>}
          </div>
          {s.about_image_url && <img className="media" src={s.about_image_url} alt="Inside the restaurant" loading="lazy" />}
        </div>
      </section>

      <section id="menu" className="section soft">
        <div className="wrap">
          <div className="sec-head sec-row">
            <div><h2>Our Menu</h2><p>Add your favorites and check out as a guest. You pay at the restaurant.</p></div>
            <Link href="/menu" className="btn rust">See full menu</Link>
          </div>
          <div className="dish-grid" style={{ marginTop: 0 }}>
            {dishes.map((i) => <DishCard key={i.id} item={i} canOrder={s.accepting_orders} />)}
          </div>
          {!s.accepting_orders && <div className="error" style={{ marginTop: '1.5rem' }}>We are not taking online orders right now. Please call {s.phone}.</div>}
          <div className="btn-row" style={{ justifyContent: 'center', marginTop: '2rem' }}><Link href="/menu" className="btn line">See more dishes</Link></div>
        </div>
      </section>

      <section id="gallery" className="section">
        <div className="wrap">
          <div className="sec-head sec-row"><h2>Gallery</h2>{(gallery?.length || 0) > 12 && <Link href="/gallery" className="btn line sm">View all</Link>}</div>
          {gallery?.length ? <GalleryGrid items={gallery.slice(0, 12)} /> : <p className="lead">Photos of our food and restaurant are coming soon.</p>}
        </div>
      </section>

      <section id="reservation" className="section soft">
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div>
            <div className="sec-head"><h2>Reservations and Catering</h2></div>
            <p className="lead">Book a table for dinner, reserve space for an event, or ask us to cater yours.</p>
            <div className="info-item"><span className="icon-badge"><Icon name="clock" size={22} /></span><div><h3>Opening hours</h3><p className="pre">{s.hours}</p></div></div>
            <div className="info-item"><span className="icon-badge"><Icon name="phone" size={22} /></span><div><h3>Prefer to call?</h3><p><a href={telHref(s.phone)}>{s.phone}</a></p></div></div>
            <p className="muted">We confirm every reservation by phone or email. Your table is not held until you hear from us.</p>
          </div>
          <BookingTabs
            reserve={s.reservations_enabled
              ? <ReservationForm slots={timeSlots(s.open_time, s.close_time)} minDate={today} maxDate={addDays(today, 180)} />
              : <div className="form-card"><h3>Online reservations are paused</h3><p className="muted">Please call <a href={telHref(s.phone)}>{s.phone}</a> and we will book you in.</p></div>}
            catering={s.catering_enabled
              ? <CateringForm minDate={today} />
              : <div className="form-card"><h3>Catering requests are paused</h3><p className="muted">Please call <a href={telHref(s.phone)}>{s.phone}</a>.</p></div>}
          />
        </div>
      </section>

      <section id="testimonials" className="section">
        <div className="wrap">
          <div className="sec-head center"><h2>Testimonials</h2><p>What our guests say about us.</p></div>
          {reviews?.length ? (
            <>
              <div className="score" style={{ justifyContent: 'center' }}><b>{avg.toFixed(1)}</b><div><span className="stars">{stars(Math.round(avg))}</span><div className="muted">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div></div></div>
              <ReviewCards reviews={reviews.slice(0, 6)} />
            </>
          ) : <p className="lead" style={{ textAlign: 'center', marginInline: 'auto' }}>Be the first to share your experience.</p>}
          <div className="btn-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            {s.google_review_url && <a className="btn rust" href={s.google_review_url} target="_blank" rel="noopener noreferrer">Review us on Google</a>}
            <Link className="btn line" href="/review">Share feedback</Link>
          </div>
        </div>
      </section>

      <section id="contact" className="section soft">
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div>
            <div className="sec-head"><h2>Contact Us</h2></div>
            <InfoList s={s} />
            <div className="btn-row" style={{ marginTop: '1.5rem' }}>
              <a className="btn rust" href={directionsUrl(s)} target="_blank" rel="noopener noreferrer">Get directions</a>
              <a className="btn line" href={telHref(s.phone)}>Call us</a>
            </div>
          </div>
          <ActionForm action={submitContact} className="form-card" resetOnSuccess>
            <h3 style={{ fontFamily: 'var(--font-display), serif', fontSize: '1.7rem', marginBottom: '1rem' }}>Send us a message</h3>
            <div className="form-grid">
              <div className="field"><label htmlFor="m-name">Name</label><input id="m-name" name="name" required autoComplete="name" /></div>
              <div className="field"><label htmlFor="m-phone">Phone (optional)</label><input id="m-phone" name="phone" type="tel" autoComplete="tel" /></div>
              <div className="field full"><label htmlFor="m-email">Email</label><input id="m-email" name="email" type="email" required autoComplete="email" /></div>
              <div className="field full"><label htmlFor="m-msg">Message</label><textarea id="m-msg" name="message" rows={4} required maxLength={2000} /></div>
            </div>
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <SubmitButton className="btn rust" pendingText="Sending...">Send message</SubmitButton>
          </ActionForm>
        </div>
        <div className="wrap" style={{ marginTop: '2.5rem' }}><MapEmbed s={s} /></div>
      </section>

    </>
  );
}
