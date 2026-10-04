import { round2 } from './cart';
import { todayISO, money, digits } from './format';

// Checks a promo code against the database. Used for the preview at checkout and again when the order is placed.
export async function evaluatePromo(db, raw, subtotal, phone) {
  const code = String(raw || '').trim().toUpperCase();
  if (!code) return { none: true };
  const { data: p } = await db.from('promo_codes').select('*').eq('code', code).maybeSingle();
  if (!p || !p.active) return { error: 'That promo code is not valid.' };
  const today = todayISO();
  if (p.starts_on && today < p.starts_on) return { error: 'That promo code is not active yet.' };
  if (p.expires_on && today > p.expires_on) return { error: 'That promo code has expired.' };
  if (subtotal < Number(p.min_subtotal)) return { error: `Spend at least ${money(p.min_subtotal)} to use this code.` };

  const { data: used } = await db.from('orders').select('phone').eq('promo_code', code).neq('status', 'cancelled');
  const uses = used ?? [];
  if (p.max_uses != null && uses.length >= p.max_uses) return { error: 'That promo code has been fully redeemed.' };
  if (phone && p.per_phone != null && uses.filter((o) => digits(o.phone) === digits(phone)).length >= p.per_phone) {
    return { error: 'You have already used this promo code.' };
  }
  const value = Number(p.value);
  const discount = round2(p.kind === 'percent' ? (subtotal * Math.min(value, 100)) / 100 : Math.min(value, subtotal));
  return { code, discount, label: p.kind === 'percent' ? `${value}% off` : `${money(value)} off`, promo: p };
}
