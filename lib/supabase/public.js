import { createClient } from '@supabase/supabase-js';

// Cookie-free read-only client for public data (feeds, share images). Row Level Security still applies.
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}
