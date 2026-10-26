// Home hero: dishes slide across the restaurant table from right to left as the visitor scrolls.
// Dishes on the back row are smaller and slower, dishes on the front row are bigger and faster, which gives the depth.
// Slot: [row 0 (front, nearest) to 1 (back), size multiplier, start position (vw from left edge), speed, tilt deg]
export const DEFAULT_LAYER = '/hero-table.webp';
export const SLOTS = [
  [0.05, 1.15, 48, 1.35, -5], [0.55, 0.9, 70, 1.0, 4], [0.95, 0.75, 58, 0.75, -3], [0.2, 1.05, 92, 1.3, 6],
  [0.75, 0.8, 86, 0.85, -6], [0.4, 1.0, 110, 1.15, 3], [0.9, 0.75, 104, 0.78, 5], [0.1, 1.1, 128, 1.35, -4],
  [0.6, 0.9, 122, 1.0, 7], [0.3, 1.0, 146, 1.2, -2], [0.85, 0.75, 140, 0.8, 4], [0.5, 0.95, 164, 1.1, 2],
];
export const SWEEP = 235; // vw travelled across the whole scroll, scaled by each dish's speed
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Pure function so the server render and the browser agree on the first frame.
export function frame(slot, p) {
  const [, , x0, speed, tilt] = slot;
  const x = x0 - p * SWEEP * speed;
  const facing = clamp((x - 50) / 70, -1, 1) * -14;            // turns slightly toward the middle of the table
  const opacity = clamp((x + 22) / 12) * clamp((130 - x) / 12); // fade only while off-screen
  return { transform: `translate3d(calc(${x.toFixed(2)}vw - 50%), 0, 0) rotateY(${(facing + tilt).toFixed(2)}deg)`, opacity: opacity.toFixed(3) };
}
export function layout(urls) {
  const n = urls.length;
  if (!n) return [];
  const count = Math.min(SLOTS.length, Math.max(8, n));
  return Array.from({ length: count }, (_, i) => ({ url: urls[i % n], slot: SLOTS[i] }));
}
