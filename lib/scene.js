// 3D side-scroll of food on the home page hero. Dishes sit at different depths and slide from the right to the
// left as the visitor scrolls. Nearer dishes are bigger and move faster, which is what gives the depth.
// Slot: [top %, depth px (negative = far), size multiplier, start position (vw from the left edge), speed, tilt deg]
export const SLOTS = [
  [38, 120, 1.15, 52, 1.25, -6], [68, -150, 1.0, 82, 1.0, 5], [20, -450, 0.8, 68, 0.75, 8], [80, 180, 1.0, 94, 1.3, -9],
  [52, -600, 0.7, 78, 0.62, 4], [28, 60, 0.95, 100, 1.15, -4], [72, -380, 0.8, 112, 0.85, 7], [14, -120, 0.8, 128, 1.0, -7],
  [58, 210, 1.1, 140, 1.4, 6], [88, -520, 0.7, 90, 0.7, -3], [44, -250, 0.9, 120, 0.9, 9], [8, -650, 0.65, 60, 0.6, -5],
];
export const SWEEP = 235; // vw travelled over the whole scroll, scaled by each dish's speed
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Pure function so the server render and the browser agree on the first frame.
export function frame(slot, p) {
  const [, z, , x0, speed, tilt] = slot;
  const x = x0 - p * SWEEP * speed;
  const facing = clamp((x - 50) / 60, -1, 1) * -26;           // turns toward the middle of the screen
  const spin = Math.sin(p * Math.PI * 2 + x0) * 4;             // gentle wobble while moving
  const opacity = clamp((x + 30) / 20) * clamp((170 - x) / 20); // fade only off-screen
  return { transform: `translate3d(${x.toFixed(2)}vw, 0, ${z}px) rotateY(${(facing + tilt).toFixed(2)}deg) rotateZ(${(tilt * 0.6 + spin).toFixed(2)}deg)`, opacity: opacity.toFixed(3) };
}
export function layout(urls) {
  const n = urls.length;
  if (!n) return [];
  const count = Math.min(SLOTS.length, Math.max(8, n));
  return Array.from({ length: count }, (_, i) => ({ url: urls[i % n], slot: SLOTS[i] }));
}
