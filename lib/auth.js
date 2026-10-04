import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, profile: null, isAdmin: false };
  const { data: profile } = await sb.from('profiles').select('full_name, phone, is_admin').eq('id', user.id).maybeSingle();
  return { user, profile, isAdmin: !!profile?.is_admin };
}

// Returns { sb, user } for an administrator, otherwise null.
export async function getAdmin() {
  const { user, isAdmin } = await getSession();
  if (!user || !isAdmin) return null;
  return { sb: await createClient(), user };
}

// Admin pages and actions call this. Visitors without admin rights are sent to /admin, which shows the login.
export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect('/admin');
  return a;
}
