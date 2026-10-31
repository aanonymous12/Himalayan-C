import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Keeps the Supabase login session fresh on every request.
export async function middleware(request) {
  if (request.nextUrl.pathname === '/Connect') return NextResponse.redirect(new URL('/connect', request.url)); // NFC cards are often typed with a capital C
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  // A slow or failing login check must never break a page (share crawlers and search bots included).
  try { await supabase.auth.getUser(); } catch {}
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|.*/opengraph-image|.*/twitter-image|sitemap.xml|robots.txt|blog/feed.xml|logo|icon|.*\\.(?:svg|png|jpg|jpeg|webp|ico|xml|txt)$).*)'],
};
