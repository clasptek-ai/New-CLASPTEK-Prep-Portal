'use client';

import React, { forwardRef } from 'react';
import { TopNavigationProps } from './navigation.types';
import { Input } from '../input/Input';
import { LogoBadge } from '../logo/LogoBadge';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../providers/ThemeProvider';

export const TopNavigation = forwardRef<HTMLElement, TopNavigationProps>(function TopNavigation(
  { logo, user, onSearch, onToggleTheme, actions, children, style, ...props },
  ref
) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleThemeToggle = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      toggleTheme();
    }
  };

  return (
    <header
      ref={ref}
      style={{
        height: '64px',
        backgroundColor: 'var(--surface-0)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        color: 'var(--text-primary)',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handleThemeToggle}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-1)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast), color var(--transition-fast)',
          }}
        >
          {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {actions}
      </div>
    </header>
  );
});
