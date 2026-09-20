'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '../../providers/AuthProvider';
import { logAuthRedirectToLogin } from '@/lib/auth-logger';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { ClasptekLoadingScreen } from '../feedback/ClasptekLoadingScreen';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR' | 'SYSTEM_ADMIN';

export function normalizeRole(rawRole: string): UserRole {
  const r = (rawRole || '').toUpperCase().trim();
  if (
    r === 'SUPER ADMINISTRATOR' ||
    r === 'SYSTEM_ADMIN' ||
    r === 'SUPER_ADMIN' ||
    r === 'ADMINISTRATOR' ||
    r === 'ADMIN'
  ) {
    return 'ADMINISTRATOR';
  }
  if (r === 'INSTRUCTOR' || r === 'SUPERVISOR') {
    return 'INSTRUCTOR';
  }
  return 'STUDENT';
}

interface RouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { roles, isAuthenticated, isLoading: authLoading, user, refetchSession } = useAuthContext();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function evaluateAccess() {
      if (authLoading) return;

      const checkAccess = (userRoles: string[]) => {
        const normalized = userRoles.map(normalizeRole);
        const isAdmin = normalized.includes('ADMINISTRATOR');
        const matchesAllowed = normalized.some((role) =>
          allowedRoles.map((a) => normalizeRole(a)).includes(role)
        );
        return isAdmin || matchesAllowed;
      };

      if (isAuthenticated && roles.length > 0) {
        const hasAccess = checkAccess(roles);
        if (!hasAccess) {
          router.push('/error?code=UNAUTHORIZED');
        } else {
          if (isMounted) {
            setAuthorized(true);
            setLoading(false);
          }
        }
        return;
      }

      // Check if session exists in Supabase browser client before deciding action
      let currentSession: any = null;
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let supabaseUserId: string | null = null;

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session: sbSession },
        } = await supabase.auth.getSession();

        if (sbSession) {
          currentSession = sbSession;
          accessToken = sbSession.access_token;
          refreshToken = sbSession.refresh_token;
          supabaseUserId = sbSession.user?.id || null;
        }
      } catch {
        // Ignored
      }

      // If NO browser session exists at all, DO NOT call refetchSession()!
      // Immediately redirect to /login to avoid triggering server getUser/refresh calls.
      if (!currentSession) {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : pathname;
        logAuthRedirectToLogin({
          reason: `RouteGuard: Access denied on protected route ${pathname}. No active browser session.`,
          currentUrl,
          session: null,
          accessToken: null,
          refreshToken: null,
          userId: user?.id || null,
          authUserRepoId: null,
        });

        if (isMounted) {
          setLoading(false);
          router.push('/login');
        }
        return;
      }

      // Session exists in browser -> attempt refetch once for full server role verification
      await refetchSession();

      const currentUrl = typeof window !== 'undefined' ? window.location.href : pathname;
      const isDevMock = process.env.NEXT_PUBLIC_DEV_MOCK_AUTH === 'true';

      if (isDevMock && typeof window !== 'undefined') {
        const userRole = (localStorage.getItem('user-role') as string) || 'STUDENT';
        const hasAccess = checkAccess([userRole]);
        if (!hasAccess) {
          router.push('/error?code=UNAUTHORIZED');
        } else {
          if (isMounted) {
            setAuthorized(true);
            setLoading(false);
          }
        }
        return;
      }

      // If after refetch we are still unauthenticated -> redirect to /login
      logAuthRedirectToLogin({
        reason: `RouteGuard: Access denied on protected route ${pathname}. Session is unauthenticated.`,
        currentUrl,
        session: currentSession,
        accessToken,
        refreshToken,
        userId: user?.id || null,
        authUserRepoId: supabaseUserId || user?.id || null,
      });

      if (isMounted) {
        setLoading(false);
        router.push('/login');
      }
    }

    evaluateAccess();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, router, pathname, roles, isAuthenticated, authLoading, user, refetchSession]);

  if (authLoading || loading) {
    return (
      <ClasptekLoadingScreen context="auth" message="Securing your session…" showSecurityBadge />
    );
  }

  return authorized ? <>{children}</> : null;
}
