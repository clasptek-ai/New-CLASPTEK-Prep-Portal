'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '../../providers/AuthProvider';
import { Button } from '../ui/button/Button';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export interface RBACGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const RBACGuard: React.FC<RBACGuardProps> = ({ children, allowedRoles }) => {
  const { session, roles, isLoading } = useAuthContext();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          color: '#94a3b8',
        }}
      >
        Verifying security authorization...
      </div>
    );
  }

  const isStudent = !roles || roles.length === 0 || roles.includes('STUDENT') && !roles.some(r => ['ADMINISTRATOR', 'SUPER_ADMIN', 'INSTRUCTOR', 'STAFF', 'PROGRAMME_MANAGER'].includes(r));

  // 1. Strict Security Rule: Students MUST NEVER access /admin/*
  if (isStudent && pathname.startsWith('/admin')) {
    return <ForbiddenAccessScreen reason="Students do not have permission to access the Enterprise Administration Workspace." />;
  }

  // 2. Instructor Restricted Sections Check
  const isInstructorOnly = roles.includes('INSTRUCTOR') && !roles.some(r => ['ADMINISTRATOR', 'SUPER_ADMIN', 'SUPER_ADMINISTRATOR'].includes(r));
  const restrictedInstructorPaths = ['/admin/settings', '/admin/system', '/admin/audit', '/admin/permissions', '/admin/roles'];
  const isRestrictedForInstructor = isInstructorOnly && restrictedInstructorPaths.some(p => pathname.startsWith(p));

  if (isRestrictedForInstructor) {
    return <ForbiddenAccessScreen reason="Instructor accounts are restricted from accessing System Settings, Audit Logs, and Security Administration." />;
  }

  // 3. Custom allowedRoles check if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return <ForbiddenAccessScreen reason="Your active account role lacks required permissions for this feature module." />;
    }
  }

  return <>{children}</>;
};

export const ForbiddenAccessScreen: React.FC<{ reason?: string }> = ({
  reason = 'You do not have administrative permissions to view this security domain.',
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19',
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: '16px',
          backgroundColor: '#111827',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'inline-flex',
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              textTransform: 'uppercase',
            }}
          >
            HTTP 403 FORBIDDEN
          </span>
          <h2 style={{ margin: '0.75rem 0 0.25rem', fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc' }}>
            Access Denied
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {reason}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
          <Link href="/dashboard" style={{ width: '100%', textDecoration: 'none' }}>
            <Button
              variant="primary"
              size="md"
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                gap: '0.5rem',
              }}
            >
              <ArrowLeft size={16} /> Return to Student Workspace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
