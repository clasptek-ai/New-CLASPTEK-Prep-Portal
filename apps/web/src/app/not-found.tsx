import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-0)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          fontWeight: 800,
          color: 'var(--brand-primary)',
          margin: '1.5rem 0 0.5rem',
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 1rem',
        }}
      >
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '480px', marginBottom: '2rem' }}>
        The requested resource or candidate page could not be located on the Clasptek Global Academy
        Portal.
      </p>
      <Link href="/">
        <button
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Return to Homepage
        </button>
      </Link>
    </div>
  );
}
