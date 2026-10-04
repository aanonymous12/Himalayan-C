import PageHero from '@/components/PageHero';
import GalleryGrid from '@/components/GalleryGrid';
import CtaBand from '@/components/CtaBand';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Gallery',
  description: 'Photos and videos of our food, restaurant and events in San Marcos, TX.',
  alternates: { canonical: '/gallery' },
};

export default async function Gallery() {
  const sb = await createClient();
  const { data } = await sb.from('gallery_items').select('*').order('sort_order').order('created_at', { ascending: false });
  return (
    <>
      <PageHero title="Gallery" sub="Our food, our restaurant, our events." />
      <section className="section"><div className="wrap"><GalleryGrid items={data ?? []} /></div></section>
      <CtaBand />
    </>
  );
}
