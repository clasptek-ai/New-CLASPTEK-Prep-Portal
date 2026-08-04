'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { authService } from '../services/auth.service';

export function useGlobalLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const executeSignOut = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      // 1. Sign out of Supabase Auth Client
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut().catch(() => null);

      // 2. Call backend server logout API to invalidate SSR cookies & revoke session
      await authService.logout().catch(() => null);

      // 3. Clear browser storage & analytics caches
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } finally {
      setIsLoggingOut(false);
      setIsConfirmOpen(false);
      // 4. Redirect to login with signedOut indicator
      window.location.href = '/login?signedOut=true';
    }
  }, []);

  const handleLogout = useCallback(() => {
    // Check if candidate is currently in an active assessment player session
    const isPlayerRoute = pathname?.includes('/student/assessments/player');
    const hasActiveAttempt = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('active_attempt_id'));

    if (isPlayerRoute || hasActiveAttempt) {
      setIsConfirmOpen(true);
    } else {
      executeSignOut();
    }
  }, [pathname, executeSignOut]);

  const cancelLogout = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const confirmLogout = useCallback(() => {
    executeSignOut();
  }, [executeSignOut]);

  return {
    handleLogout,
    isConfirmOpen,
    cancelLogout,
    confirmLogout,
    isLoggingOut,
  };
}
