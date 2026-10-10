import PageHero from '@/components/PageHero';
import BuffetFeedback from '@/components/BuffetFeedback';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import { BUFFET_GROUPS } from '@/lib/format';

export const metadata = {
  title: 'Buffet',
  description: "See what is on the buffet today at Himalayan Nepalese & Indian Cuisine in San Marcos, TX, and tell us how it was.",
  alternates: { canonical: '/buffet' },
};
export const dynamic = 'force-dynamic';

// Point a table QR code or NFC tag at /buffet. The "today" list and its visibility are controlled in Dashboard > Buffet.
export default async function BuffetPage() {
  const s = await getSettings();
  const b = { show_today: true, ...(s.buffet || {}) };
  let dishes = [];
  if (b.show_today) {
    const sb = await createClient();
    const { data } = await sb.from('buffet_items').select('*').eq('today', true).order('sort_order').order('name');
    dishes = data || [];
  }
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const groups = [...BUFFET_GROUPS, ...new Set(dishes.map((d) => d.category).filter((c) => !BUFFET_GROUPS.includes(c)))]
    .map((g) => [g, dishes.filter((d) => d.category === g)]).filter(([, l]) => l.length);

  return (
    <>
      <PageHero title="Buffet" sub={b.show_today ? "See what is being served, then tell us how it was." : 'Tell us how your buffet visit was.'} />
      {b.show_today && (
        <section className="section" aria-labelledby="today-h">
          <div className="wrap" style={{ maxWidth: 900 }}>
            <div className="sec-head"><h2 id="today-h">What&apos;s in the buffet today</h2><p className="muted" style={{ margin: 0 }}>{day}</p></div>
            {(b.price || b.hours) && (
              <div className="bf-meta">
                {b.price && <span><small>Price</small><b>{b.price}</b></span>}
                {b.hours && <span><small>Served</small><b>{b.hours}</b></span>}
              </div>
            )}
            {groups.length ? (
              <div className="bf-groups">
                {groups.map(([g, list]) => (
                  <div key={g} className="bf-group">
                    <h3>{g}</h3>
                    <ul>{list.map((d) => <li key={d.id}><span className="bf-name">{d.name}{d.vegetarian && <span className="veg" title="Vegetarian" />}</span>{d.description && <small>{d.description}</small>}</li>)}</ul>
                  </div>
                ))}
              </div>
            ) : <p className="lead">Today&apos;s buffet will be posted here soon.</p>}
            {b.note && <p className="bf-note">{b.note}</p>}
            {groups.length > 0 && <p className="muted" style={{ marginTop: '1.25rem' }}><span className="veg" style={{ marginRight: 8 }} />Vegetarian. Please tell us about allergies.</p>}
          </div>
        </section>
      )}
      <section className={`section${b.show_today ? ' soft' : ''}`} aria-labelledby="fb-h">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="sec-head"><h2 id="fb-h">How was the buffet?</h2><p className="muted" style={{ margin: 0 }}>It takes less than a minute. Your feedback goes straight to the kitchen team.</p></div>
          <BuffetFeedback />
        </div>
      </section>
    </>
  );
}
