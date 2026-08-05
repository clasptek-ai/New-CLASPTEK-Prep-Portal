import React from 'react';

/**
 * Admin portal loading skeleton.
 * Shown by Next.js Suspense for all /admin/* routes.
 * Mimics the admin dashboard layout with sidebar + data table shimmer.
 */
export default function AdminLoading() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #1a2540 25%, #243050 50%, #1a2540 75%)',
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
        backgroundColor: '#090d16',
        display: 'flex',
      }}
    >
      {/* Sidebar skeleton */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          backgroundColor: '#0c1220',
          borderRight: '1px solid #1a2540',
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
            <div key={i} aria-hidden="true" style={{ ...shimmer, height: 100, borderRadius: 12 }} />
          ))}
        </div>

        {/* Data table skeleton */}
        <div
          style={{
            backgroundColor: '#0c1220',
            border: '1px solid #1a2540',
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
              borderBottom: '1px solid #1a2540',
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
                borderBottom: row < 5 ? '1px solid #0f1729' : 'none',
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
          * { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
