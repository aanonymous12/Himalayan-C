import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Email links (confirm account, reset password) land here and become a login session.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const n = searchParams.get('next') || '/';
  const next = n.startsWith('/') && !n.startsWith('//') ? n : '/';
  if (code) {
    const sb = await createClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
