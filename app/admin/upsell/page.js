import ActionForm, { SubmitButton } from '@/components/ActionForm';
import { requireAdmin } from '@/lib/auth';
import { money } from '@/lib/format';
import { saveUpsell } from '../actions';

export default async function AdminUpsell() {
  const { sb } = await requireAdmin();
  const [{ data: cats }, { data: items, error }] = await Promise.all([
    sb.from('menu_categories').select('id,name').order('sort_order').order('name'),
    sb.from('menu_items').select('*').order('sort_order').order('name'),
  ]);
  const list = items ?? [];
  const missing = !!error || (list.length > 0 && !('upsell' in list[0]));
  const price = (i) => (i.options?.length ? `from ${money(Math.min(...i.options.map((o) => Number(o.price))))}` : money(i.price));
  const chosen = list.filter((i) => i.upsell).length;

  return (
    <>
      <div className="page-head"><div><h1>Checkout add-ons</h1><p className="muted">When a guest taps Checkout, they see &quot;Complete your meal&quot; with up to four of these, one tap to add. It shows once per order and they can skip it.</p></div></div>
      {missing && <div className="error">One-time setup: open the Supabase SQL editor and run <b>supabase/update_v7.sql</b>, then reload this page.</div>}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <h2>How it picks</h2>
        <ul className="plain">
          <li>Dishes you set as <b>Goes well with</b> on a dish (Menu &gt; open a dish) come first, when that dish is in the cart.</li>
          <li>Then the dishes ticked below, favouring categories the guest has not ordered from yet (a drink or dessert after a main).</li>
          <li>Anything already in the cart is never suggested. Sold-out dishes are skipped.</li>
        </ul>
        <p className="hint">Good picks: drinks (mango lassi, chai), breads (naan), sides (rice, raita, chutney), desserts (gulab jamun), sauces and dips.</p>
      </div>
      <ActionForm action={saveUpsell}>
        <p><b>{chosen}</b> {chosen === 1 ? 'dish' : 'dishes'} offered to everyone</p>
        {(cats ?? []).map((c) => {
          const rows = list.filter((i) => i.category_id === c.id);
          return rows.length ? (
            <section key={c.id} style={{ marginBottom: '1.2rem' }}>
              <h3 style={{ margin: '0 0 .4rem' }}>{c.name}</h3>
              <div className="up-admin">
                {rows.map((i) => (
                  <label key={i.id} className={i.available ? '' : 'off'}>
                    <input type="checkbox" name="upsell" value={i.id} defaultChecked={!!i.upsell} />
                    {i.image_url ? <img src={i.image_url} alt="" /> : <span className="ph" />}
                    <span><b>{i.name}</b><small>{price(i)}{!i.available ? ' · sold out' : ''}</small></span>
                  </label>
                ))}
              </div>
            </section>
          ) : null;
        })}
        <SubmitButton className="btn">Save checkout add-ons</SubmitButton>
      </ActionForm>
    </>
  );
}
