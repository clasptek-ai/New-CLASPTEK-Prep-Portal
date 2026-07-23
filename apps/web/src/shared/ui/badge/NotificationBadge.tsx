import React from 'react';
import { NotificationBadgeProps } from './badge.types';

export function NotificationBadge({
  count,
  max = 99,
  dot = false,
  children,
}: NotificationBadgeProps) {
  const displayCount = count !== undefined && count > max ? `${max}+` : count;

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {(dot || count !== undefined) && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: 'var(--radius-full, 9999px)',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: dot ? '4px' : '0.1rem 0.35rem',
            lineHeight: 1,
            minWidth: dot ? 'auto' : '14px',
            height: dot ? 'auto' : '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 2px var(--bg-surface-0, #111827)',
          }}
        >
          {!dot && displayCount}
        </span>
      )}
    </div>
  );
}
