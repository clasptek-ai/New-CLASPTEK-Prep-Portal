import React from 'react';

/**
 * Admin portal loading skeleton.
 * Shown by Next.js Suspense for all /admin/* routes.
 * Mimics the admin dashboard layout with sidebar + cards + data table shimmer
 * using canonical Clasptek light surfaces to prevent dark-to-light visual flash.
 */
export default function AdminLoading() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.6s infinite linear',
    borderRadius: 8,
  };

  return (
    <div
      role="status"
      aria-label="Loading admin portal"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface-page, #f8fafc)',
        display: 'flex',
      }}
    >
      {/* Sidebar skeleton */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          backgroundColor: 'var(--surface-0, #ffffff)',
          borderRight: '1px solid var(--border, #e2e8f0)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          aria-hidden="true"
          style={{ ...shimmer, height: 36, width: '75%', marginBottom: '1.25rem' }}
        />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{ ...shimmer, height: 30, width: i % 4 === 0 ? '50%' : '85%' }}
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
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div aria-hidden="true" style={{ ...shimmer, height: 36, width: '30%' }} />
          <div
            aria-hidden="true"
            style={{ ...shimmer, height: 36, width: '15%', borderRadius: 8 }}
          />
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                backgroundColor: 'var(--surface-0, #ffffff)',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 12,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ ...shimmer, height: 16, width: '60%' }} />
              <div style={{ ...shimmer, height: 28, width: '40%' }} />
            </div>
          ))}
        </div>

        {/* Data table skeleton */}
        <div
          style={{
            backgroundColor: 'var(--surface-0, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            aria-hidden="true"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
              gap: '1rem',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--surface-1, #f8fafc)',
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ ...shimmer, height: 14, borderRadius: 4 }} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              aria-hidden="true"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                gap: '1rem',
                padding: '1rem 1.5rem',
                borderBottom: row < 5 ? '1px solid var(--border, #e2e8f0)' : 'none',
              }}
            >
              {Array.from({ length: 5 }).map((_, col) => (
                <div
                  key={col}
                  style={{
                    ...shimmer,
                    height: 14,
                    width: col === 4 ? '60%' : '90%',
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          ))}
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
