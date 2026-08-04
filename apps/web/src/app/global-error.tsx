'use client';

import React from 'react';

/**
 * Global Error Boundary — `apps/web/src/app/global-error.tsx`
 *
 * Catches catastrophic errors that escape all route-level error.tsx files.
 * Must render its own <html> + <body> because it replaces the root layout.
 *
 * SECURITY: Never exposes raw error.message in production.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          role="alert"
          aria-live="assertive"
          style={{
            maxWidth: '520px',
            width: '90%',
            backgroundColor: '#0f1729',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}
          >
            ⚠️
          </div>
          <h2 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.3rem', fontWeight: 700 }}>
            Critical System Error
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {isProduction
              ? 'An unexpected critical error occurred. Our team has been automatically notified. Please try again or return to the home page.'
              : (error?.message ?? 'An unexpected application error occurred.')}
          </p>
          {error?.digest && (
            <p style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="global-error-try-again"
              onClick={() => reset()}
              aria-label="Try reloading the application"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              id="global-error-go-home"
              aria-label="Return to Clasptek home page"
              style={{
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'inline-block',
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
