import Icon from '@/components/Icon';
import Media from '@/components/Media';
import HoursCard from '@/components/HoursCard';
import PageHero from '@/components/PageHero';
import CtaBand from '@/components/CtaBand';
import InfoList from '@/components/InfoList';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'Our story',
  description: 'A Nepali and Indian restaurant in San Marcos, TX, cooking family recipes fresh every day.',
  alternates: { canonical: '/about' },
};

export default async function About() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Our story" sub="Family recipes from Nepal and India, cooked fresh in San Marcos." />
      <section className="section">
        <div className="wrap split">
          <div><div className="sec-head"><h2>Where we come from</h2></div><p className="lead">{s.story}</p></div>
          <Media src={s.about_image_url} alt="Our restaurant" fallback={<HoursCard s={s} />} />
        </div>
      </section>
      <section className="section soft">
        <div className="wrap">
          <div className="sec-head center"><h2>Our philosophy</h2><p>{s.philosophy}</p></div>
          <div className="cards c3">
            <div className="card option"><span className="icon-badge"><Icon name="leaf" /></span><h3>Fresh every day</h3><p>Dishes are prepared daily and cooked to order, never reheated from a bag.</p></div>
            <div className="card option"><span className="icon-badge"><Icon name="flame" /></span><h3>Authentic technique</h3><p>Slow-simmered curries, hand-folded momo, and naan baked in the tandoor.</p></div>
            <div className="card option"><span className="icon-badge"><Icon name="heart" /></span><h3>Warm hospitality</h3><p>You are a guest first. Ask us for a recommendation, we love choosing for people.</p></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap split flip">
          <div><div className="sec-head"><h2>The experience</h2></div><p className="lead">Eat in with friends and family, pick up an order on your way home, or book us for your next celebration.</p><InfoList s={s} /></div>
          <div className="cards c2" style={{ alignContent: 'start' }}>
            <div className="card"><h3>Dine in</h3><p className="muted" style={{ margin: '.4rem 0 0' }}>Reserve a table or simply walk in.</p></div>
            <div className="card"><h3>Pickup</h3><p className="muted" style={{ margin: '.4rem 0 0' }}>Order online and collect when ready.</p></div>
            <div className="card"><h3>Catering</h3><p className="muted" style={{ margin: '.4rem 0 0' }}>Platters for groups and events.</p></div>
            <div className="card"><h3>Events</h3><p className="muted" style={{ margin: '.4rem 0 0' }}>Birthdays, anniversaries and gatherings.</p></div>
          </div>
        </div>
      </section>
      <CtaBand title="Come hungry." text="See the menu and order online, or book a table." />
    </>
  );
}
