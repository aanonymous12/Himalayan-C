// About page "walk inside": photos from the street into the dining room, scrolled through in 3D.
// The admin manages them in Settings; until then these three are used.
export const DEFAULT_WALK = [
  { url: '/walk-1.jpg', caption: 'Welcome to Himalayan' },
  { url: '/walk-2.jpg', caption: 'Step through the door' },
  { url: '/walk-3.jpg', caption: 'Find your table' },
];
export function walkSteps(h3) {
  const w = (h3 && h3.walk) || {};
  if (w.enabled === false) return [];
  const steps = Array.isArray(w.steps) ? w.steps.filter((s) => s && /^(https?:\/\/|\/)/.test(String(s.url))) : [];
  return steps.length >= 2 ? steps.slice(0, 8) : DEFAULT_WALK;
}
