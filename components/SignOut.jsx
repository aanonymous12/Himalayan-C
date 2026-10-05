'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOut({ className = '' }) {
  const router = useRouter();
  return (
    <button type="button" className={className} onClick={async () => { await createClient().auth.signOut(); router.push('/'); router.refresh(); }}>
      Log out
    </button>
  );
}
