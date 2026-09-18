'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /results route — redirects to the canonical student results view at /student/results.
 */
export default function StudentResultsDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/results');
  }, [router]);

  return (
    <div className="min-h-screen bg-(--background) flex items-center justify-center text-(--text-muted) text-sm">
      Loading your examination results...
    </div>
  );
}
