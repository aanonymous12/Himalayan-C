import Link from 'next/link';
import ActionForm, { SubmitButton } from '@/components/ActionForm';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { BUFFET_GROUPS, stars, when } from '@/lib/format';
import { saveBuffetSettings, saveBuffetToday, clearBuffetToday, saveBuffetItem, deleteBuffetItem, setBuffetFeedbackRead, deleteBuffetFeedback } from '../actions';

export const metadata = { title: 'Buffet' };
const TABS = [['today', "Today's buffet"], ['dishes', 'Dishes'], ['feedback', 'Feedback']];

function DishFields({ d }) {
  return (
    <>
      <div className="grid2">
        <div className="field"><label>Dish name</label><input name="name" required maxLength={80} defaultValue={d?.name || ''} /></div>
        <div className="field"><label>Group</label><select name="category" defaultValue={d?.category || 'Mains'}>{BUFFET_GROUPS.map((g) => <option key={g}>{g}</option>)}</select></div>
      </div>
      <div className="field"><label>Short description (optional)</label><input name="description" maxLength={200} defaultValue={d?.description || ''} /></div>
      <label className="check-row" style={{ marginTop: 0, marginBottom: '1rem' }}><input type="checkbox" name="vegetarian" defaultChecked={!!d?.vegetarian} /><span>Vegetarian</span></label>
    </>
  );
}

export default async function AdminBuffet({ searchParams }) {
  const { sb } = await requireAdmin();
  const { tab: q } = await searchParams;
  const tab = TABS.some(([k]) => k === q) ? q : 'today';
  const s = await getSettings();
  const b = { show_today: true, price: '', hours: '', note: '', ...(s.buffet || {}) };
  const [items, fb, menu] = await Promise.all([
    sb.from('buffet_items').select('*').order('sort_order').order('name'),
    sb.from('buffet_feedback').select('*').order('is_read').order('created_at', { ascending: false }).limit(200),
    sb.from('menu_items').select('id,name,vegetarian,category_id,menu_categories(name,slug,sort_order)').order('sort_order'),
  ]);
  const missing = !!items.error;
  const all = items.data ?? [], feedback = fb.data ?? [];
  const dishes = all.filter((d) => !d.menu_item_id);                       // buffet-only dishes
  const onMenuToday = new Set(all.filter((d) => d.menu_item_id && d.today).map((d) => d.menu_item_id));
  const menuGroups = Object.values((menu.data ?? []).reduce((acc, m) => {
    const c = m.menu_categories; if (!c) return acc;
    (acc[c.slug] ||= { name: c.name, order: c.sort_order, list: [] }).list.push(m); return acc;
  }, {})).sort((x, y) => x.order - y.order);
  const unread = feedback.filter((f) => !f.is_read).length;
  const avg = feedback.length ? feedback.reduce((n, f) => n + f.rating, 0) / feedback.length : 0;
  const groupsOf = (list) => [...BUFFET_GROUPS, ...new Set(list.map((d) => d.category).filter((c) => !BUFFET_GROUPS.includes(c)))].map((g) => [g, list.filter((d) => d.category === g)]).filter(([, l]) => l.length);
  const onToday = all.filter((d) => d.today).length;

  return (
    <>
      <div className="page-head">
        <div><h1>Buffet</h1><p className="muted">Choose what is on the buffet today, hide the section when there is no buffet, and read what guests say. Guests see the page at <b>/buffet</b>.</p></div>
        <a className="btn sm rust" href="/buffet" target="_blank" rel="noopener noreferrer">Open the page</a>
      </div>
      {missing && <div className="error">The buffet tables are not in your database yet. Open Supabase, SQL Editor, and run <code>supabase/update_v4.sql</code> once. Then reload this page.</div>}

      <nav className="tabs-bar" aria-label="Buffet sections">
        {TABS.map(([k, label]) => <Link key={k} href={`/admin/buffet?tab=${k}`} aria-current={tab === k ? 'page' : undefined}>{label}{k === 'feedback' && unread > 0 && <span className="badge">{unread} new</span>}</Link>)}
      </nav>

      {tab === 'today' && (
        <>
          <div className="panel">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '.25rem' }}>Show on the website</h2>
            <p className="hint" style={{ marginTop: 0 }}>Turn this off to hide the whole &quot;What&apos;s in the buffet today&quot; section. The feedback form stays.</p>
            <ActionForm action={saveBuffetSettings}>
              <label className="check-row" style={{ marginTop: 0 }}><input type="checkbox" name="show_today" defaultChecked={b.show_today} /><span>Show &quot;What&apos;s in the buffet today&quot; on the Buffet page</span></label>
              <div className="grid2" style={{ marginTop: '1rem' }}>
                <div className="field"><label>Price (optional)</label><input name="price" maxLength={60} defaultValue={b.price} placeholder="$14.99 adults, $8.99 kids" /></div>
                <div className="field"><label>Served (optional)</label><input name="hours" maxLength={80} defaultValue={b.hours} placeholder="12:00 PM to 3:00 PM" /></div>
              </div>
              <div className="field"><label>Note for guests (optional)</label><input name="note" maxLength={300} defaultValue={b.note} placeholder="Dishes may change depending on ingredients." /></div>
              <SubmitButton className="btn sm">Save</SubmitButton>
            </ActionForm>
          </div>

          <div className="panel" style={{ marginTop: '1.25rem' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Pick today&apos;s dishes <span className="muted">({onToday} selected)</span></h2>
              {onToday > 0 && <form action={clearBuffetToday}><button className="btn sm line">Clear all</button></form>}
            </div>
            <ActionForm action={saveBuffetToday}>
              <div style={{ marginTop: '1.25rem' }}>
                {dishes.length > 0 && <h3 className="pick-title">Buffet-only dishes <small>(not on the Menu page)</small></h3>}
                {groupsOf(dishes).map(([g, list]) => (
                  <div className="pick-group" key={g}>
                    <h4>{g}</h4>
                    <div className="pick-grid">{list.map((d) => <label className="pick" key={d.id}><input type="checkbox" name="today" value={d.id} defaultChecked={d.today} /><span>{d.name}</span></label>)}</div>
                  </div>
                ))}
                {dishes.length === 0 && <p className="muted">No buffet-only dishes yet. Add them under the Dishes tab.</p>}

                <h3 className="pick-title" style={{ marginTop: '2rem' }}>From the main menu <small>(opens to pick; the Menu page is not changed)</small></h3>
                {menuGroups.length === 0 && <p className="muted">No menu dishes found.</p>}
                {menuGroups.map((g) => (
                  <details className="pick-menu" key={g.name} open={g.list.some((m) => onMenuToday.has(m.id))}>
                    <summary>{g.name} <span className="muted">({g.list.length})</span></summary>
                    <div className="pick-grid">{g.list.map((m) => <label className="pick" key={m.id}><input type="checkbox" name="menu_today" value={m.id} defaultChecked={onMenuToday.has(m.id)} /><span>{m.name}{m.vegetarian && <i className="veg" />}</span></label>)}</div>
                  </details>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem' }}><SubmitButton className="btn">Save today&apos;s buffet</SubmitButton></div>
              <p className="hint">The list stays until you change it, so remember to update it each day.</p>
            </ActionForm>
          </div>
        </>
      )}

      {tab === 'dishes' && (
        <>
          <details className="edit" open style={{ marginBottom: '1.5rem' }}>
            <summary><b>Add a buffet-only dish</b></summary>
            <ActionForm action={saveBuffetItem} resetOnSuccess><DishFields /><SubmitButton className="btn sm">Add dish</SubmitButton></ActionForm>
          </details>
          <p className="hint" style={{ marginTop: 0 }}>Dishes here exist only on the buffet and never appear on the Menu page. To put a regular menu dish on the buffet, pick it on the Today&apos;s buffet tab.</p>
          {dishes.length === 0 && !missing && <p className="muted">No buffet-only dishes yet.</p>}
          {groupsOf(dishes).map(([g, list]) => (
            <div key={g} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-body), sans-serif', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>{g}</h3>
              {list.map((d) => (
                <details className="edit" key={d.id}>
                  <summary><span><b>{d.name}</b>{d.vegetarian && <span className="veg" style={{ marginLeft: 8 }} />}{d.today && <span className="badge">On today</span>}</span><span className="muted">Edit</span></summary>
                  <ActionForm action={saveBuffetItem}>
                    <input type="hidden" name="id" value={d.id} />
                    <DishFields d={d} />
                    <div className="row"><SubmitButton className="btn sm">Save</SubmitButton><DeleteButton action={deleteBuffetItem} id={d.id} confirmText={`Delete ${d.name}?`} /></div>
                  </ActionForm>
                </details>
              ))}
            </div>
          ))}
        </>
      )}

      {tab === 'feedback' && (
        <>
          {feedback.length > 0 && (
            <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '1.5rem' }}>
              <div className="stat"><span>Average rating</span><b>{avg.toFixed(1)} / 5</b></div>
              <div className="stat"><span>Responses</span><b>{feedback.length}</b></div>
              <div className="stat"><span>Not read yet</span><b>{unread}</b></div>
            </div>
          )}
          {!feedback.length && <p className="muted">No buffet feedback yet. It appears here as guests send it from the Buffet page.</p>}
          {feedback.map((f) => (
            <div className="order" key={f.id} style={{ opacity: f.is_read ? .65 : 1 }}>
              <div className="order-top"><b>{f.name || 'Anonymous'} <span className="stars">{stars(f.rating)}</span></b><span className="muted">{when(f.created_at)}</span></div>
              {f.email && <div className="muted"><a href={`mailto:${f.email}`}>{f.email}</a></div>}
              {f.message ? <p style={{ margin: '.5rem 0 .75rem', whiteSpace: 'pre-wrap' }}>{f.message}</p> : <p className="muted" style={{ margin: '.5rem 0 .75rem' }}>No comment, rating only.</p>}
              <div className="row">
                <form action={setBuffetFeedbackRead}><input type="hidden" name="id" value={f.id} /><input type="hidden" name="read" value={String(f.is_read)} /><button className="btn sm line">{f.is_read ? 'Mark as new' : 'Mark as read'}</button></form>
                <DeleteButton action={deleteBuffetFeedback} id={f.id} confirmText="Delete this feedback?" />
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
