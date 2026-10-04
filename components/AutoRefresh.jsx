'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Keeps the orders screen live while the kitchen is busy.
export default function AutoRefresh({ seconds = 30 }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
