import React from 'react';

/**
 * Root loading skeleton — shown by Next.js Suspense while
 * the root route and layout data are being fetched.
 */
export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Loading Clasptek portal"
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Logo placeholder */}
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: '12px',
          background: 'linear-gradient(90deg, #1a2540 25%, #243050 50%, #1a2540 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-shimmer 1.6s infinite linear',
        }}
      />

      {/* Spinner ring */}
      <div
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid #1e2d45',
          borderTopColor: '#3b82f6',
          animation: 'spin 0.8s linear infinite',
        }}
      />

      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
