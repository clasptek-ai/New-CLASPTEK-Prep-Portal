import React, { forwardRef } from 'react';
import { TopNavigationProps } from './navigation.types';
import { Input } from '../input/Input';
import { LogoBadge } from '../logo/LogoBadge';

export const TopNavigation = forwardRef<HTMLElement, TopNavigationProps>(function TopNavigation(
  { logo, user, onSearch, onToggleTheme, actions, children, style, ...props },
  ref
) {
  return (
    <header
      ref={ref}
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface-0, #ffffff)',
        borderBottom: '1px solid var(--border-default, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        color: 'var(--text-primary, #131b2e)',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {logo || <LogoBadge size="sm" />}
      </div>

      {onSearch && (
        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search portal (Ctrl+K)..."
            size="sm"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.0rem' }}>
        {actions}
      </div>
    </header>
  );
});
