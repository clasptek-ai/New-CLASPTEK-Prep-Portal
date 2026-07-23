'use client';

import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Admin Sidebar Navigation Shell */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-surface-0)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1rem',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            }}
          />
          <span style={{ fontSize: '1rem', fontWeight: 800 }}>Admin Console</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <a
            href="/admin"
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-2)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Administration Console
          </a>
        </nav>
      </aside>

      {/* Main Content Workspace Scroll Region */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
