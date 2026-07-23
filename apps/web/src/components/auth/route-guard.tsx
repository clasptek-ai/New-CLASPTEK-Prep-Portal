'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

// Client-side cache to prevent duplicate session validation API calls
let cachedSession: { roles: UserRole[] } | null = null;

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const checkAccess = (roles: string[]) => {
        const normalized = roles.map(normalizeRole);
        const isAdmin = normalized.includes('ADMINISTRATOR');
        const matchesAllowed = normalized.some((role) =>
          allowedRoles.map((a) => normalizeRole(a)).includes(role)
        );
        return isAdmin || matchesAllowed;
      };

      // 1. Resolve from cache if available
      if (cachedSession) {
        const hasAccess = checkAccess(cachedSession.roles);
        if (active) {
          if (!hasAccess) {
            router.push('/error?code=UNAUTHORIZED');
          } else {
            setAuthorized(true);
          }
          setLoading(false);
        }
        return;
      }

      // 2. Fetch session from server endpoint
      try {
        const res = await fetch('/api/v1/auth/session');
        if (res.ok) {
          const data = await res.json();
          const rawRoles = (data.roles || []) as string[];
          const normalizedRoles = rawRoles.map(normalizeRole);
          cachedSession = { roles: normalizedRoles };

          const hasAccess = checkAccess(rawRoles);
          if (active) {
            if (!hasAccess) {
              router.push('/error?code=UNAUTHORIZED');
            } else {
              setAuthorized(true);
            }
            setLoading(false);
          }
          return;
        } else if (res.status === 401) {
          // Unauthenticated session -> Redirect to login
          if (active) {
            router.push('/login');
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        console.error('Session verification request failed', err);
      }

      // 3. Fallback logic for Dev/Test mode
      const isDevMock = process.env.NEXT_PUBLIC_DEV_MOCK_AUTH === 'true';
      if (isDevMock) {
        const userRole = (localStorage.getItem('user-role') as string) || 'STUDENT';
        const hasAccess = checkAccess([userRole]);
        if (active) {
          if (!hasAccess) {
            router.push('/error?code=UNAUTHORIZED');
          } else {
            setAuthorized(true);
          }
          setLoading(false);
        }
      } else {
        // Production mode: Treat as unauthenticated, redirect to login
        if (active) {
          router.push('/login');
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [allowedRoles, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          color: '#cbd5e1',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h3>Verifying authentication access...</h3>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
