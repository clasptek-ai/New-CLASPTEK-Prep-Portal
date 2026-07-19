'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR';

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
      // 1. Resolve from cache if available
      if (cachedSession) {
        const hasAccess = cachedSession.roles.some(role => allowedRoles.includes(role));
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
          const userRoles = (data.roles || []) as UserRole[];
          cachedSession = { roles: userRoles };
          
          const hasAccess = userRoles.some(role => allowedRoles.includes(role));
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
      } catch (err) {
        console.error('Session verification request failed', err);
      }

      // 3. Fallback logic for Dev/Test mode
      const isDevMock = process.env.NEXT_PUBLIC_DEV_MOCK_AUTH === 'true';
      if (isDevMock) {
        const userRole = (localStorage.getItem('user-role') as UserRole) || 'STUDENT';
        const hasAccess = allowedRoles.includes(userRole);
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', color: '#cbd5e1' }}>
        <h3>Verifying authentication access...</h3>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
