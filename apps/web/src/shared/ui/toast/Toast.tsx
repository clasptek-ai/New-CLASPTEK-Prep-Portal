import React, { useEffect } from 'react';
import { ToastProps } from './toast.types';

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, message, variant = 'info', duration = 4000 } = toast;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return { backgroundColor: '#064e3b', borderColor: '#10b981', color: '#a7f3d0' };
      case 'warning':
        return { backgroundColor: '#78350f', borderColor: '#f59e0b', color: '#fde68a' };
      case 'error':
        return { backgroundColor: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5' };
      default:
        return { backgroundColor: '#1e3a8a', borderColor: '#3b82f6', color: '#bfdbfe' };
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem 1.0rem',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid',
        fontSize: '0.875rem',
        fontWeight: 500,
        boxShadow: 'var(--shadow-lg)',
        minWidth: '240px',
        ...getVariantStyles(),
      }}
    >
      <div>{message}</div>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'currentColor',
          cursor: 'pointer',
          fontSize: '1.0rem',
          opacity: 0.8,
        }}
      >
        ×
      </button>
    </div>
  );
}
