// Home hero: the dishes start centred on the table. Scrolling down sends the left-hand dishes off the left edge and the
// right-hand ones off the right edge; scrolling back up brings them back to the centre in the same way.
// Slot: [row 0 (front, nearest) to 1 (back), size multiplier, resting x (vw), resting x on phones (vw), tilt deg, scroll start, scroll end]
// Back-row dishes are smaller (perspective). Each dish leaves during its own slice of the scroll; front dishes leave first.
export const DEFAULT_LAYER = '/hero-table.webp';
export const SLOTS = [
  [0.08, 1.2, 40, 50, -4, 0.00, 0.55],
  [0.5, 0.95, 22, 20, -3, 0.04, 0.68],
  [0.5, 0.95, 78, 80, 3, 0.04, 0.68],
  [0.92, 0.8, 31, 35, -2, 0.08, 0.78],
  [0.92, 0.8, 69, 65, 2, 0.08, 0.78],
  [0.08, 1.2, 60, 60, 4, 0.00, 0.55],
  [0.92, 0.75, 10, 8, -2, 0.12, 0.85],
  [0.92, 0.75, 90, 92, 2, 0.12, 0.85],
];
export const PHONE_COUNT = 5; // phones show the first five
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Pure function so the server render and the browser agree on the first frame (p = 0: everything centred).
export function frame(slot, p, flat = false) {
  const [, , rest, phoneRest, tilt, a, b] = slot;
  const x0 = flat ? phoneRest : rest;
  const out = x0 < 50 || (flat && x0 === 50) ? -26 : 126; // left side leaves left, right side leaves right
  const t = clamp((p - a) / (b - a));
  const e = t * t * (3 - 2 * t); // smooth start and finish
  const x = x0 + (out - x0) * e;
  const rot = flat ? 0 : clamp((x - x0) / 60, -1, 1) * -16 + tilt * (1 - e);
  const opacity = clamp((x + 24) / 10) * clamp((124 - x) / 10);
  return { transform: `translate3d(calc(${x.toFixed(2)}vw - 50%), 0, 0) rotateY(${rot.toFixed(2)}deg)`, opacity: opacity.toFixed(3) };
}
export function layout(urls) {
  const n = urls.length;
  if (!n) return [];
  const count = Math.min(SLOTS.length, Math.max(6, n));
  return Array.from({ length: count }, (_, i) => ({ url: urls[i % n], slot: SLOTS[i] }));
}
