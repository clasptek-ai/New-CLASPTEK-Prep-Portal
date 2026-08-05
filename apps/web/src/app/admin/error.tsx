'use client';

import React from 'react';

/**
 * Admin Portal Error Boundary — `apps/web/src/app/admin/error.tsx`
 *
 * Caught by Next.js for all rendering errors in the /admin/* route segment.
 * Shows more technical detail to admins than student-facing errors.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        role="alert"
        aria-live="assertive"
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#0f1729',
          border: '1px solid #1e2d45',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.5rem',
          }}
        >
          ⚙️
        </div>

        <h1
          style={{ margin: '0 0 0.75rem', fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}
        >
          Admin Portal Error
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
          {isProduction
            ? 'An error occurred in the admin portal. The error has been logged for investigation.'
            : (error?.message ?? 'An unexpected error occurred.')}
        </p>

        {/* Show stack trace for admins in dev */}
        {!isProduction && error?.stack && (
          <pre
            style={{
              textAlign: 'left',
              backgroundColor: '#0b0f19',
              border: '1px solid #1e2d45',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontSize: '0.7rem',
              color: '#f87171',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {error.stack}
          </pre>
        )}

        {error?.digest && (
          <p
            style={{
              color: '#475569',
              fontSize: '0.75rem',
              marginBottom: '1.5rem',
              fontFamily: 'monospace',
            }}
          >
            Error Digest: {error.digest}
          </p>
        )}

        <div
          style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            id="admin-error-try-again"
            onClick={() => reset()}
            aria-label="Try loading this admin page again"
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <a
            href="/admin/dashboard"
            id="admin-error-dashboard"
            aria-label="Return to admin dashboard"
            style={{
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
