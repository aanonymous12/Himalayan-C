// Prices a cart from the database's own menu data. The browser only says WHAT was chosen, never the price.
export const round2 = (n) => Math.round(n * 100) / 100;

export function priceLines(menuById, lines) {
  if (!Array.isArray(lines) || !lines.length) return { error: 'Your cart is empty.' };
  if (lines.length > 60) return { error: 'That is a lot of items. Please call us for large orders.' };
  const rows = [];
  for (const l of lines) {
    const m = menuById[l?.itemId];
    const qty = Math.floor(Number(l?.qty));
    if (!m || !m.available) return { error: `${l?.name || 'An item'} is no longer available. Please remove it and try again.` };
    if (!(qty >= 1 && qty <= 50)) return { error: 'Quantities must be between 1 and 50.' };

    let price = Number(m.price), optionLabel = null;
    if (m.options?.length) {
      const o = m.options.find((x) => x.label === l.option);
      if (!o) return { error: `Please re-add ${m.name}. Its options changed.` };
      price = Number(o.price); optionLabel = o.label;
    }

    let spice = null;
    if (m.spice_levels?.length) {
      if (!m.spice_levels.includes(l.spice)) return { error: `Please choose a spice level for ${m.name}.` };
      spice = l.spice;
    }

    const labels = Array.isArray(l.addons) ? l.addons : [];
    if (new Set(labels).size !== labels.length) return { error: 'Duplicate add-ons were selected.' };
    const addons = [];
    for (const label of labels) {
      const a = (m.addons || []).find((x) => x.label === label);
      if (!a) return { error: `An add-on for ${m.name} is no longer offered. Please re-add the dish.` };
      addons.push({ label: a.label, price: Number(a.price) });
      price += Number(a.price);
    }

    const note = String(l.note || '').trim().slice(0, 200) || null;
    rows.push({ menu_item_id: m.id, name: m.name, option_label: optionLabel, spice, addons, note, unit_price: round2(price), qty });
  }
  return { rows, subtotal: round2(rows.reduce((n, r) => n + r.unit_price * r.qty, 0)) };
}
