import React from 'react';
import { NavigationGroupProps } from './navigation.types';

export function NavigationGroup({ title, isCollapsed = false, children }: NavigationGroupProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {title && !isCollapsed && (
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted, #94a3b8)',
            padding: '0 0.875rem 0.5rem 0.875rem',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>{children}</div>
    </div>
  );
}
