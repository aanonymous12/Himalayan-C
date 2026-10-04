import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, profile: null, isAdmin: false };
  const { data: profile } = await sb.from('profiles').select('full_name, phone, is_admin').eq('id', user.id).maybeSingle();
  return { user, profile, isAdmin: !!profile?.is_admin };
}

// Every admin page and every admin action calls this. RLS is the second lock.
export async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: p } = await sb.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!p?.is_admin) redirect('/');
  return { sb, user };
}
