import React from 'react';

/**
 * Student portal loading skeleton.
 * Shown by Next.js Suspense for all /student/* routes.
 * Mimics the student portal layout with sidebar + content shimmer.
 */
export default function StudentLoading() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #1a2540 25%, #243050 50%, #1a2540 75%)',
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
        backgroundColor: '#090d16',
        display: 'flex',
      }}
    >
      {/* Sidebar skeleton */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          backgroundColor: '#0c1220',
          borderRight: '1px solid #1a2540',
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
            <div key={i} aria-hidden="true" style={{ ...shimmer, height: 120, borderRadius: 12 }} />
          ))}
        </div>

        {/* Content block */}
        <div aria-hidden="true" style={{ ...shimmer, height: 280, borderRadius: 12 }} />

        {/* Text lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{ ...shimmer, height: 16, width: i === 2 ? '60%' : '100%' }}
            />
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
