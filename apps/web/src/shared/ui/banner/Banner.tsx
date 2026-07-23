import React, { forwardRef } from 'react';
import { BannerProps } from './banner.types';

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { variant = 'info', action, onDismiss, style, children, ...props },
  ref
) {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'maintenance':
        return { backgroundColor: '#78350f', color: '#fde68a' };
      case 'warning':
        return { backgroundColor: '#b45309', color: '#fef3c7' };
      case 'success':
        return { backgroundColor: '#065f46', color: '#d1fae5' };
      default:
        return { backgroundColor: '#1e40af', color: '#dbeafe' };
    }
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Platform Announcement"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.625rem 1.25rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        width: '100%',
        boxSizing: 'border-box',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>{children}</span>
        {action}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss banner"
          style={{
            background: 'none',
            border: 'none',
            color: 'currentColor',
            cursor: 'pointer',
            fontSize: '1.1rem',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
});
