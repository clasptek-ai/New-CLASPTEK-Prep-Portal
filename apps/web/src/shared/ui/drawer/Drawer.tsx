import React, { useEffect, useId } from 'react';
import { DrawerProps } from './drawer.types';
import { OverlayPortal } from '../overlay/OverlayPortal';
import { OverlayManager } from '../overlay/OverlayManager';

export function Drawer({
  isOpen,
  onClose,
  title,
  position = 'right',
  size = '360px',
  children,
}: DrawerProps) {
  const id = useId();

  useEffect(() => {
    if (isOpen) {
      OverlayManager.register(id, 'drawer');
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        OverlayManager.unregister(id);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, id, onClose]);

  if (!isOpen) return null;

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'left':
        return {
          top: 0,
          bottom: 0,
          left: 0,
          width: size,
          borderRight: '1px solid var(--border-default, #1e293b)',
        };
      case 'top':
        return {
          top: 0,
          left: 0,
          right: 0,
          height: size,
          borderBottom: '1px solid var(--border-default, #1e293b)',
        };
      case 'bottom':
        return {
          bottom: 0,
          left: 0,
          right: 0,
          height: size,
          borderTop: '1px solid var(--border-default, #1e293b)',
        };
      default:
        return {
          top: 0,
          bottom: 0,
          right: 0,
          width: size,
          borderLeft: '1px solid var(--border-default, #1e293b)',
        };
    }
  };

  return (
    <OverlayPortal>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1450,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : 'Drawer Panel'}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            backgroundColor: 'var(--bg-surface-0, #111827)',
            boxShadow: 'var(--shadow-2xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...getPositionStyles(),
          }}
        >
          {title && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '1.0rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #f8fafc)',
                }}
              >
                {title}
              </h4>
              <button
                onClick={onClose}
                aria-label="Close drawer"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          )}

          <div
            style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1,
              fontSize: '0.875rem',
              color: 'var(--text-secondary, #cbd5e1)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
