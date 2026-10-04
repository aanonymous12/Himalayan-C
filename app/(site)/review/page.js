import PageHero from '@/components/PageHero';
import ReviewChooser from '@/components/ReviewChooser';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'How was your visit?', description: 'Tell us about your visit to Himalayan Nepalese & Indian Cuisine.', robots: { index: false } };

// Point your NFC tags and table QR codes at /review.
export default async function ReviewPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="How was your visit?" sub="Your feedback helps us get better every day." />
      <section className="section"><div className="wrap" style={{ maxWidth: 760 }}><ReviewChooser googleUrl={s.google_review_url} /></div></section>
    </>
  );
}
