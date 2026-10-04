// "Chicken, Hot spice, + Extra naan" under a dish name in carts and orders.
export default function LineDetails({ line }) {
  const bits = [
    line.option || line.option_label,
    line.spice && `${line.spice} spice`,
    (line.addons || []).length ? (line.addons || []).map((a) => `+ ${a.label}`).join(', ') : null,
  ].filter(Boolean);
  if (!bits.length && !line.note) return null;
  return <div className="muted" style={{ fontSize: '.9rem' }}>{bits.join(' \u00b7 ')}{line.note && <div>Note: {line.note}</div>}</div>;
}
