import React from 'react';

/**
 * Student portal loading skeleton.
 * Shown by Next.js Suspense for all /student/* routes.
 * Mimics the student portal layout with sidebar + cards shimmer
 * using canonical Clasptek light surfaces to prevent dark-to-light visual flash.
 */
export default function StudentLoading() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.6s infinite linear',
    borderRadius: 8,
  };

  return (
    <div
      role="status"
      aria-label="Loading student portal"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface-page, #f8fafc)',
        display: 'flex',
      }}
    >
      {/* Sidebar skeleton */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          backgroundColor: 'var(--surface-0, #ffffff)',
          borderRight: '1px solid var(--border, #e2e8f0)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Logo */}
        <div
          aria-hidden="true"
          style={{ ...shimmer, height: 36, width: '80%', marginBottom: '1rem' }}
        />
        {/* Nav items */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{ ...shimmer, height: 32, width: i % 3 === 0 ? '90%' : '70%' }}
          />
        ))}
      </div>

      {/* Main content skeleton */}
      <div
        style={{
          flex: 1,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <div aria-hidden="true" style={{ ...shimmer, height: 40, width: '40%' }} />

        {/* Cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                backgroundColor: 'var(--surface-0, #ffffff)',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 12,
                padding: '1.25rem',
                height: 120,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ ...shimmer, height: 16, width: '50%', marginBottom: 12 }} />
              <div style={{ ...shimmer, height: 28, width: '35%' }} />
            </div>
          ))}
        </div>

        {/* Content block */}
        <div
          aria-hidden="true"
          style={{
            backgroundColor: 'var(--surface-0, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 12,
            padding: '1.5rem',
            height: 240,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ ...shimmer, height: 24, width: '30%' }} />
          <div style={{ ...shimmer, height: 14, width: '90%' }} />
          <div style={{ ...shimmer, height: 14, width: '80%' }} />
          <div style={{ ...shimmer, height: 14, width: '60%' }} />
        </div>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
