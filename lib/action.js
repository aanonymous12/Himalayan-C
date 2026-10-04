// Wraps a server action so errors come back as messages instead of crashing the page.
// Works for forms using <ActionForm> (prevState, formData) and plain <form action> (formData).
export async function run(a, b, handler) {
  const fd = b ?? a;
  try {
    const r = await handler(fd);
    return r ?? { ok: true, message: 'Saved.' };
  } catch (e) {
    const d = String(e?.digest || '');
    if (d.startsWith('NEXT_REDIRECT') || d.startsWith('NEXT_NOT_FOUND')) throw e;
    console.error('[action]', e);
    return { error: e?.message || 'Something went wrong. Please try again.' };
  }
}
