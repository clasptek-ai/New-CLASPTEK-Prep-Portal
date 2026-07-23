import React, { forwardRef } from 'react';
import { StatusBadgeProps } from './status.types';

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  { variant = 'info', label, dot = true, style, ...props },
  ref
) {
  const getVariantStyles = (): { bg: string; color: string; border: string; dotColor: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '#10b981',
          dotColor: '#10b981',
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '#f59e0b',
          dotColor: '#f59e0b',
        };
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '#ef4444',
          dotColor: '#ef4444',
        };
      case 'offline':
        return {
          bg: 'rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          border: '#64748b',
          dotColor: '#64748b',
        };
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: '#3b82f6',
          dotColor: '#3b82f6',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <span
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.625rem',
        borderRadius: 'var(--radius-full, 9999px)',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '0.4rem',
            height: '0.4rem',
            borderRadius: '50%',
            backgroundColor: v.dotColor,
          }}
        />
      )}
      {label}
    </span>
  );
});
