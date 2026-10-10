export const TZ = 'America/Chicago';
export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const telHref = (p) => `tel:+1${String(p).replace(/\D/g, '').replace(/^1/, '')}`;
export const when = (d) =>
  new Date(d).toLocaleString('en-US', { timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const dayKey = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ });
export const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
export const nowHHMM = () => new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
export const dateLong = (d) =>
  new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
export const dateShort = (d) =>
  new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const timeLabel = (t) => {
  const [h, m] = String(t).split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
// Half-hour reservation slots from opening until one hour before closing.
export function timeSlots(open = '12:00', close = '21:00') {
  const [oh, om] = open.split(':').map(Number), [ch, cm] = close.split(':').map(Number);
  const out = [];
  for (let m = oh * 60 + om; m <= ch * 60 + cm - 60; m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  return out;
}
export const closedDays = (s) => String(s ?? '').split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number);
export const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
export const slugify = (s) => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
export const STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled'];
export const STATUS_LABEL = { new: 'New', preparing: 'Preparing', ready: 'Ready for pickup', completed: 'Picked up', cancelled: 'Cancelled' };
export const RES_STATUSES = ['pending', 'confirmed', 'declined', 'cancelled', 'completed'];
export const RES_LABEL = { pending: 'Pending', confirmed: 'Confirmed', declined: 'Declined', cancelled: 'Cancelled', completed: 'Completed' };
export const digits = (s) => String(s ?? '').replace(/\D/g, '');
export const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const hourOf = (d) => Number(new Date(d).toLocaleString('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false })) % 24;

export const BUFFET_GROUPS = ['Starters', 'Mains', 'Sides', 'Desserts'];
