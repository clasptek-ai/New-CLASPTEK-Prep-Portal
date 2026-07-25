'use client';

import React from 'react';
import { Button } from '../../shared/ui/button/Button';
import { BrandConfig } from '@/config/brand.config';
import { LogoBadge } from '../../shared/ui/logo/LogoBadge';

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-app, #0f172a)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.0rem 2.0rem',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          borderBottom: '1px solid var(--border-default, #1e293b)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LogoBadge size="md" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={() => (window.location.href = '/login')}>
            Sign In
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = '/register')}>
            Get Started
          </Button>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer
        style={{
          padding: '2.0rem',
          textAlign: 'center',
          borderTop: '1px solid var(--border-default, #1e293b)',
          color: 'var(--text-muted, #94a3b8)',
          fontSize: '0.875rem',
        }}
      >
        {BrandConfig.copyrightText}
      </footer>
    </div>
  );
}

export default PublicShell;
