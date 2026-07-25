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

import { useAuthContext } from '../../providers/AuthProvider';

export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const router = useRouter();
  const { roles, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setAuthorized(true);
      }
      setLoading(false);
    } else {
      const isDevMock = process.env.NEXT_PUBLIC_DEV_MOCK_AUTH === 'true';
      if (isDevMock) {
        const userRole = (localStorage.getItem('user-role') as string) || 'STUDENT';
        const hasAccess = checkAccess([userRole]);
        if (!hasAccess) {
          router.push('/error?code=UNAUTHORIZED');
        } else {
          setAuthorized(true);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    }
  }, [allowedRoles, router, roles, isAuthenticated, authLoading]);

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
