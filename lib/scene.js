// Home hero: dishes slide in from the right across the restaurant table and settle in a tidy spread
// centred on the table, so the scene looks composed when the visitor reaches the end of the scroll.
// Slot: [row 0 (front, nearest) to 1 (back), size multiplier, start x (vw), settled x (vw), tilt deg, scroll start, scroll end]
// Back-row dishes are smaller (perspective). Each dish moves during its own slice of the scroll and then rests.
export const DEFAULT_LAYER = '/hero-table.webp';
export const SLOTS = [
  [0.08, 1.25, 100, 50, 0, 0.00, 0.62],
  [0.5, 0.95, 88, 37, 3, 0.02, 0.70],
  [0.5, 0.95, 118, 63, -3, 0.08, 0.76],
  [0.92, 0.8, 108, 30, 2, 0.04, 0.72],
  [0.92, 0.8, 135, 70, -2, 0.12, 0.80],
  [0.12, 1.1, 150, 22, 4, 0.15, 0.84],
  [0.12, 1.1, 170, 78, -4, 0.20, 0.86],
  [0.5, 0.9, 160, 12, -3, 0.18, 0.82],
  [0.5, 0.9, 185, 88, 3, 0.24, 0.88],
];
export const PHONE_COUNT = 5; // phones show the first five, which already form a balanced centred spread
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Pure function so the server render and the browser agree on the first frame.
export function frame(slot, p, flat = false) {
  const [, , x0, end, tilt, a, b] = slot;
  const x1 = flat ? 50 + (end - 50) * 1.5 : end; // phones: spread wider because the table is narrow
  const t = clamp((p - a) / (b - a));
  const e = 1 - Math.pow(1 - t, 3); // fast entry, gentle landing
  const x = x0 + (x1 - x0) * e;
  const rot = flat ? 0 : clamp((x - x1) / 60, -1, 1) * -14 + tilt * (1 - e) + tilt * 0.3;
  const opacity = clamp((130 - x) / 12);
  return { transform: `translate3d(calc(${x.toFixed(2)}vw - 50%), 0, 0) rotateY(${rot.toFixed(2)}deg)`, opacity: opacity.toFixed(3) };
}
export function layout(urls) {
  const n = urls.length;
  if (!n) return [];
  const count = Math.min(SLOTS.length, Math.max(7, n));
  return Array.from({ length: count }, (_, i) => ({ url: urls[i % n], slot: SLOTS[i] }));
}
