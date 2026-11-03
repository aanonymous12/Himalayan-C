import { createPublicClient } from '@/lib/supabase/public';

// Dishes offered on the "Complete your meal" step: the ones the restaurant ticked for everyone, plus any dish that is
// named under "Goes well with" on another dish. Read on the server, so the step always has its data.
export async function loadUpsell() {
  const empty = { items: [], pairs: {} };
  try {
    const db = createPublicClient();
    const [{ data: items, error }, { data: cats }] = await Promise.all([
      db.from('menu_items').select('id,name,description,price,options,image_url,vegetarian,available,spice_levels,category_id,upsell,pairs').eq('available', true),
      db.from('menu_categories').select('id,name,visible').eq('visible', true),
    ]);
    if (error || !items) return empty; // the v7 update has not been run yet
    const catName = Object.fromEntries((cats || []).map((c) => [c.id, c.name]));
    const pairs = {}, wanted = new Set();
    for (const i of items) {
      const p = Array.isArray(i.pairs) ? i.pairs.filter((x) => typeof x === 'string').slice(0, 12) : [];
      if (p.length) { pairs[i.id] = p; p.forEach((x) => wanted.add(x)); }
    }
    const out = items
      .filter((i) => catName[i.category_id] && (i.upsell || wanted.has(i.id)))
      .map((i) => {
        const opt = i.options?.length ? i.options[0] : null;
        const sp = i.spice_levels?.length ? (i.spice_levels.includes('Medium') ? 'Medium' : i.spice_levels[0]) : null;
        return { id: i.id, name: i.name, description: i.description || '', image: i.image_url || null, veg: !!i.vegetarian, category: catName[i.category_id], categoryId: i.category_id, upsell: !!i.upsell, option: opt?.label || null, spice: sp, price: Number(opt ? opt.price : i.price) };
      })
      .filter((i) => Number.isFinite(i.price));
    return { items: out, pairs };
  } catch { return empty; }
}
