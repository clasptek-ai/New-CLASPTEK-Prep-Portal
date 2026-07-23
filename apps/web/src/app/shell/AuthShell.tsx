import React from 'react';
import { Card } from '../../shared/ui/card/Card';

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app, #0f172a)',
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              margin: '0 0 0.35rem 0',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary, #f8fafc)',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary, #cbd5e1)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div>{children}</div>
      </Card>
    </div>
  );
}
