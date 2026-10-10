// "Save my details" lives only in this browser (localStorage) and only when the guest ticks the box on our site.
const KEY = 'himalayan-saved-v1';

export function loadSaved() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
export function saveDetails(d) {
  try { localStorage.setItem(KEY, JSON.stringify({ name: d.name || '', phone: d.phone || '', email: d.email || '' })); } catch {}
}
export function clearSaved() {
  try { localStorage.removeItem(KEY); } catch {}
}
// Fill empty fields by id from the saved details (if there are any).
export function fillSaved(ids) {
  const s = loadSaved();
  if (!s) return false;
  for (const [field, id] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el && !el.value && s[field]) el.value = s[field];
  }
  return true;
}
