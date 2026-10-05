'use client';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { createClient } from '@/lib/supabase/client';

// Shown on public pages only while an administrator is signed in on this browser.
export default function AdminNotice() {
  const { blocked } = useCart();
  const router = useRouter();
  if (!blocked) return null;
  return (
    <div className="admin-bar" role="status">
      <span>You are signed in as an administrator, so ordering is switched off on this device.</span>
      <button type="button" onClick={async () => { await createClient().auth.signOut(); router.refresh(); }}>Log out to test an order</button>
    </div>
  );
}
