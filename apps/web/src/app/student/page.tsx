'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /student route — redirects to the canonical student dashboard at /dashboard.
 * The widget-based DashboardScreen at /dashboard is the single student home experience.
 */
export default function StudentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
