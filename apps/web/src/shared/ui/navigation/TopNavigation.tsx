import React, { forwardRef } from 'react';
import { TopNavigationProps } from './navigation.types';
import { Avatar } from '../avatar/Avatar';
import { Input } from '../input/Input';

export const TopNavigation = forwardRef<HTMLElement, TopNavigationProps>(function TopNavigation(
  { logo, user, onSearch, onToggleTheme, actions, children, style, ...props },
  ref
) {
  return (
    <header
      ref={ref}
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface-0, #111827)',
        borderBottom: '1px solid var(--border-default, #1e293b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        color: 'var(--text-primary, #f8fafc)',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.0rem' }}>
        {logo || (
          <div
            style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--primary-500, #3b82f6)' }}
          >
            Clasptek Portal
          </div>
        )}
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
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #cbd5e1)',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            🌙
          </button>
        )}

        {actions}

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                {user.name}
              </span>
              <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{user.role || user.email}</span>
            </div>
          </div>
        )}

        {children}
      </div>
    </header>
  );
});
