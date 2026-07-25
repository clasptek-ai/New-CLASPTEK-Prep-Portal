'use client';

import React from 'react';
import Link from 'next/link';
import { LogoBadge } from '../shared/ui/logo/LogoBadge';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: '#090d16',
        color: '#f8fafc',
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
      <LogoBadge size="lg" />
      <h1
        style={{ fontSize: '4rem', fontWeight: 800, color: '#38bdf8', margin: '1.5rem 0 0.5rem' }}
      >
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '2rem' }}>
        The requested resource or candidate page could not be located on the Clasptek Global Academy
        Portal.
      </p>
      <Link href="/">
        <button
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Home size={16} />
          <span>Return to Homepage</span>
        </button>
      </Link>
    </div>
  );
}
