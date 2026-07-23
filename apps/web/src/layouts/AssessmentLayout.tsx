'use client';

import React from 'react';

interface AssessmentLayoutProps {
  children: React.ReactNode;
}

export function AssessmentLayout({ children }: AssessmentLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Fullscreen Assessment Focus Header Bar */}
      <header
        style={{
          height: '56px',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
          backgroundColor: '#0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.05em',
            }}
          >
            ASSESSMENT RUNTIME FOCUS MODE
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Secure Examination Environment</div>
      </header>

      {/* Main Focus Assessment Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
