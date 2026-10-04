import DishCard from '@/components/DishCard';
import MenuNav from '@/components/MenuNav';
import PageHero from '@/components/PageHero';
import CtaBand from '@/components/CtaBand';
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
    <>
      <PageHero title="Our menu" sub="Cooked fresh to order. Add dishes to start an order for pickup." />
      <MenuNav cats={shown} />
      <div className="wrap">
        <p className="muted" style={{ marginTop: '1.5rem' }}><span className="veg" style={{ marginRight: 8 }} />Vegetarian. Please tell us about allergies when you order.</p>
        {!s.accepting_orders && <div className="error" style={{ marginTop: '1rem' }}>We are not taking online orders right now. Please call {s.phone}.</div>}
        {shown.map((c) => (
          <section key={c.id} id={`m-${c.slug}`} className="cat">
            <h2>{c.name}</h2>
            {c.description && <p>{c.description}</p>}
            <div className="dish-grid">
              {items.filter((i) => i.category_id === c.id).map((i) => <DishCard key={i.id} item={i} slug={c.slug} canOrder={s.accepting_orders} />)}
            </div>
          </section>
        ))}
      </div>
      <div style={{ height: '4rem' }} />
      <CtaBand title="Ready to order?" text="Review your cart and check out as a guest or with an account." href="/checkout" label="Go to checkout" />
    </>
  );
}
