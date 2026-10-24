// Layout of the 3D food fly-through. Each slot: x%, y%, size multiplier, start depth (px, negative = far away), tilt (deg).
// Slots keep clear of the headline on the left. Depth grows with scroll, so dishes fly toward the viewer and past it.
export const SLOTS = [
  [80, 40, 1.15, -250, -8], [62, 70, 1.0, -800, 6], [93, 72, 0.9, -1300, -12], [34, 86, 0.85, -550, 10],
  [8, 68, 1.0, -1050, -6], [68, 16, 0.8, -1600, 8], [95, 20, 0.75, -1900, 0], [50, 90, 0.8, -1750, -10],
  [20, 14, 0.7, -2000, 12], [86, 90, 0.7, -2100, 5], [45, 12, 0.7, -2200, -5], [4, 40, 0.8, -1500, 8],
];
export const SPAN = 2400;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Pure function so the server render and the browser agree on the first frame.
export function frame(slot, p) {
  const z = slot[3] + p * SPAN;
  const fadeIn = clamp((z + 2800) / 600);
  const fadeOut = clamp((520 - z) / 260);
  return { transform: `translate3d(0, 0, ${z.toFixed(1)}px) rotateZ(${(slot[4] + p * slot[4] * 1.5).toFixed(2)}deg) rotateY(${(p * -24 * Math.sign(slot[4] || 1)).toFixed(2)}deg)`, opacity: Math.min(fadeIn, fadeOut).toFixed(3) };
}
export function layout(urls) {
  const n = urls.length;
  if (!n) return [];
  const count = Math.min(SLOTS.length, Math.max(8, n));
  return Array.from({ length: count }, (_, i) => ({ url: urls[i % n], slot: SLOTS[i] }));
}
