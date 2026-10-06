'use client';
import { useRef, useState } from 'react';
import { useCart } from './CartProvider';
import { money } from '@/lib/format';

// Simple dishes add straight away. Dishes with spice levels or add-ons open a "customize" dialog first.
export default function AddToCart({ item }) {
  const { add, blocked } = useCart();
  const opts = item.options || [], spices = item.spice_levels || [], extras = item.addons || [];
  const custom = spices.length > 0 || extras.length > 0;
  const [pick, setPick] = useState(0);
  const [spice, setSpice] = useState(spices.includes('Medium') ? 'Medium' : spices[0] || '');
  const [sel, setSel] = useState([]);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const [warn, setWarn] = useState(false);
  const dlg = useRef(null);

  const chosen = extras.filter((e) => sel.includes(e.label));
  const unit = Number(opts.length ? opts[pick].price : item.price) + chosen.reduce((n, e) => n + Number(e.price), 0);
  const low = opts.length ? Math.min(...opts.map((o) => Number(o.price))) : Number(item.price);

  // Administrators see the normal button, but ordering is off for them. Tell them why instead of failing silently.
  const guard = (fn) => () => {
    if (blocked) { setWarn(true); setTimeout(() => setWarn(false), 4000); return; }
    fn();
  };

  function commit() {
    add({
      itemId: item.id, name: item.name, image: item.image_url || null, option: opts[pick]?.label || null,
      spice: spices.length ? spice : null,
      addons: chosen.map((e) => ({ label: e.label, price: Number(e.price) })),
      note: note.trim() || null, price: unit,
    });
    dlg.current?.close();
    setNote(''); setSel([]);
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  }

  const warning = warn && <span className="warn" role="alert">You cannot place an order as admin.</span>;

  if (!custom) return (
    <>
      {opts.length > 0 ? (
        <select value={pick} onChange={(e) => setPick(Number(e.target.value))} aria-label={`Choose option for ${item.name}`}>
          {opts.map((o, i) => <option key={o.label} value={i}>{o.label} - {money(o.price)}</option>)}
        </select>
      ) : <span className="price">{money(item.price)}</span>}
      <button type="button" className={`btn sm ${done ? 'gold' : 'rust'}`} onClick={guard(commit)}>{done ? '\u2713 Added' : 'Add to cart'}</button>
      {warning}
    </>
  );

  return (
    <>
      <span className="price">{opts.length ? `From ${money(low)}` : money(item.price)}</span>
      <button type="button" className={`btn sm ${done ? 'gold' : 'rust'}`} onClick={guard(() => dlg.current?.showModal())}>{done ? '\u2713 Added' : 'Add to cart'}</button>
      {warning}
      <dialog ref={dlg} className="mod" onClick={(e) => e.target === dlg.current && dlg.current.close()} aria-label={`Customize ${item.name}`}>
        <div className="mod-body">
          <div className="mod-head"><h3>{item.name}</h3><button type="button" className="icon-btn" onClick={() => dlg.current.close()} aria-label="Close">&times;</button></div>
          {item.description && <p className="muted" style={{ marginTop: 0 }}>{item.description}</p>}

          {opts.length > 0 && (
            <fieldset className="grp"><legend>Choose one</legend>
              {opts.map((o, i) => (
                <label key={o.label} className="choice-row"><input type="radio" name={`o-${item.id}`} checked={pick === i} onChange={() => setPick(i)} /><span>{o.label}</span><b>{money(o.price)}</b></label>
              ))}
            </fieldset>
          )}
          {spices.length > 0 && (
            <fieldset className="grp"><legend>Spice level</legend>
              <div className="chips">{spices.map((s) => (
                <label key={s} className="chip-radio"><input type="radio" name={`s-${item.id}`} checked={spice === s} onChange={() => setSpice(s)} /><span>{s}</span></label>
              ))}</div>
            </fieldset>
          )}
          {extras.length > 0 && (
            <fieldset className="grp"><legend>Add-ons (optional)</legend>
              {extras.map((e) => (
                <label key={e.label} className="choice-row"><input type="checkbox" checked={sel.includes(e.label)} onChange={(ev) => setSel(ev.target.checked ? [...sel, e.label] : sel.filter((x) => x !== e.label))} /><span>{e.label}</span><b>+{money(e.price)}</b></label>
              ))}
            </fieldset>
          )}
          <div className="field"><label htmlFor={`n-${item.id}`}>Special instructions (optional)</label>
            <textarea id={`n-${item.id}`} rows={2} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Allergies, no onions, extra sauce..." /></div>
          <button type="button" className="btn gold" style={{ width: '100%' }} onClick={commit}>Add to cart &middot; {money(unit)}</button>
        </div>
      </dialog>
    </>
  );
}
