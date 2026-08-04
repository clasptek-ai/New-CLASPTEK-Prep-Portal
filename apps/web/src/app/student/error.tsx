'use client';

import React from 'react';

/**
 * Student Portal Error Boundary — `apps/web/src/app/student/error.tsx`
 *
 * Caught by Next.js for all rendering errors in the /student/* route segment.
 * Provides context-appropriate recovery actions for students.
 */
export default function StudentError({
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
          maxWidth: '520px',
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
            backgroundColor: 'rgba(234,179,8,0.1)',
            border: '1px solid rgba(234,179,8,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.5rem',
          }}
        >
          📚
        </div>

        <h1
          style={{
            margin: '0 0 0.75rem',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#f8fafc',
          }}
        >
          Portal Error
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            margin: '0 0 0.5rem',
          }}
        >
          {isProduction
            ? 'Something went wrong while loading your student portal. Your assessment progress has been saved.'
            : (error?.message ?? 'An unexpected error occurred.')}
        </p>

        <p
          style={{
            color: '#64748b',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            margin: '0 0 1.75rem',
          }}
        >
          If you were in the middle of an assessment, your answers are automatically saved.
        </p>

        {error?.digest && (
          <p style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '1.75rem', fontFamily: 'monospace' }}>
            Reference: {error.digest}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="student-error-try-again"
            onClick={() => reset()}
            aria-label="Try loading this page again"
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
            href="/student"
            id="student-error-dashboard"
            aria-label="Return to student dashboard"
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
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
