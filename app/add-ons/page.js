import AddOnsStep from '@/components/AddOnsStep';
import { loadUpsell } from '@/lib/upsell';

export const metadata = { title: 'Complete your meal', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// Step 2 of ordering: Browse menu > Add-ons > Checkout and pay. Every order passes through here.
export default async function AddOns() {
  const data = await loadUpsell();
  return <AddOnsStep items={data.items} pairs={data.pairs} />;
}
