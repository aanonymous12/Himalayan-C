import CheckoutForm from '@/components/CheckoutForm';
import { getSettings } from '@/lib/settings';
import { closedDays } from '@/lib/format';

export const metadata = { title: 'Checkout', robots: { index: false } };

export default async function Checkout() {
  const s = await getSettings();
  return (
    <CheckoutForm
      taxRate={Number(s.tax_rate)} accepting={s.accepting_orders} phoneShown={s.phone}
      hours={s.hours} openTime={s.open_time} closeTime={s.close_time} closedDays={closedDays(s.closed_days)}
    />
  );
}
