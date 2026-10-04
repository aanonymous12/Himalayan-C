import CheckoutForm from '@/components/CheckoutForm';
import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Checkout', robots: { index: false } };

export default async function Checkout() {
  const [{ user, profile }, s] = await Promise.all([getSession(), getSettings()]);
  return <CheckoutForm user={user ? { email: user.email } : null} profile={profile} taxRate={Number(s.tax_rate)} accepting={s.accepting_orders} phoneShown={s.phone} />;
}
