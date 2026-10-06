import OrderMenu from '@/components/OrderMenu';
import OrderSteps from '@/components/OrderSteps';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'Menu',
  description: 'Momos, tikka masala, biryani, tandoor naan and more. Nepali and Indian dishes with prices. Order online for pickup in San Marcos, TX.',
  alternates: { canonical: '/menu' },
};

export default async function MenuPage() {
  const sb = await createClient();
  const s = await getSettings();
  const [{ data: cats }, { data: items }] = await Promise.all([
    sb.from('menu_categories').select('*').eq('visible', true).order('sort_order'),
    sb.from('menu_items').select('*').order('sort_order'),
  ]);
  const shown = (cats || []).filter((c) => items?.some((i) => i.category_id === c.id));

  return (
    <div className="order-page">
      <div className="wrap order-head">
        <h1>Order online</h1>
        <p className="muted">Fresh to order for pickup. <span className="veg" style={{ margin: '0 6px 0 4px' }} />Vegetarian. Please tell us about allergies.</p>
        <OrderSteps current={1} />
        {!s.accepting_orders && <div className="error">We are not taking online orders right now. Please call {s.phone}.</div>}
      </div>
      <OrderMenu cats={shown} items={items || []} canOrder={s.accepting_orders} />
    </div>
  );
}
