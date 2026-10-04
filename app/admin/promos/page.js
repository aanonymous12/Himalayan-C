import PromoForm from '@/components/admin/PromoForm';
import { requireAdmin } from '@/lib/auth';
import { togglePromo } from '../actions';
import { money, dateShort, todayISO } from '@/lib/format';

function state(p, uses, today) {
  if (!p.active) return ['Off', ''];
  if (p.expires_on && p.expires_on < today) return ['Expired', 'cancelled'];
  if (p.starts_on && p.starts_on > today) return ['Scheduled', 'preparing'];
  if (p.max_uses != null && uses >= p.max_uses) return ['Used up', 'cancelled'];
  return ['Active', 'ready'];
}

export default async function Promos() {
  const { sb } = await requireAdmin();
  const [{ data: promos }, { data: orders }] = await Promise.all([
    sb.from('promo_codes').select('*').order('created_at', { ascending: false }),
    sb.from('orders').select('promo_code, discount, status').not('promo_code', 'is', null).limit(5000),
  ]);
  const usage = {};
  (orders ?? []).filter((o) => o.status !== 'cancelled').forEach((o) => { const u = (usage[o.promo_code] ??= { uses: 0, saved: 0 }); u.uses += 1; u.saved += Number(o.discount); });
  const today = todayISO();
  const list = promos ?? [];

  return (
    <>
      <div className="page-head"><div><h1>Promo codes</h1><p className="muted">Customers type a code at checkout. Set how long it lasts and how many people can use it.</p></div></div>
      <details className="edit" open={list.length === 0}><summary><b>+ Create a promo code</b></summary><PromoForm /></details>
      <div style={{ height: '1rem' }} />
      {list.length === 0 && <p className="muted">No promo codes yet.</p>}
      {list.map((p) => {
        const u = usage[p.code] || { uses: 0, saved: 0 };
        const [label, cls] = state(p, u.uses, today);
        return (
          <details className="edit" key={p.id}>
            <summary>
              <span className="sum-main"><span><b>{p.code}</b> <span className={`status ${cls}`}>{label}</span>
                <span className="muted"> &nbsp;{p.kind === 'percent' ? `${Number(p.value)}% off` : `${money(p.value)} off`}{Number(p.min_subtotal) > 0 ? `, min ${money(p.min_subtotal)}` : ''}</span></span></span>
              <span className="muted">{u.uses}{p.max_uses != null ? ` / ${p.max_uses}` : ''} used &middot; {money(u.saved)} given{p.expires_on ? ` \u00b7 ends ${dateShort(p.expires_on)}` : ''}</span>
            </summary>
            <div className="row item-tools">
              <form action={togglePromo}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="active" value={String(p.active)} /><button className="btn sm line">{p.active ? 'Switch off' : 'Switch on'}</button></form>
            </div>
            <PromoForm p={p} />
          </details>
        );
      })}
    </>
  );
}
