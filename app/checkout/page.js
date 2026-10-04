import CheckoutForm from '@/components/CheckoutForm';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Checkout', robots: { index: false } };

export default async function Checkout() {
  const s = await getSettings();
  return <CheckoutForm taxRate={Number(s.tax_rate)} accepting={s.accepting_orders} phoneShown={s.phone} />;
}
