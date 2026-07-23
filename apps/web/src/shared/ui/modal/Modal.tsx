import React, { useEffect, useId } from 'react';
import { ModalProps } from './modal.types';
import { OverlayPortal } from '../overlay/OverlayPortal';
import { OverlayManager } from '../overlay/OverlayManager';

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const id = useId();

  useEffect(() => {
    if (isOpen) {
      OverlayManager.register(id, 'modal');
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

  const getMaxWidth = () => {
    switch (size) {
      case 'sm':
        return '400px';
      case 'lg':
        return '800px';
      case 'xl':
        return '1100px';
      default:
        return '600px';
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1400,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : 'Modal Dialog'}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--bg-surface-0, #111827)',
            border: '1px solid var(--border-default, #1e293b)',
            borderRadius: 'var(--radius-xl, 16px)',
            boxShadow: 'var(--shadow-2xl)',
            width: '100%',
            maxWidth: getMaxWidth(),
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            overflow: 'hidden',
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
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #f8fafc)',
                }}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close dialog"
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

          {footer && (
            <div
              style={{
                padding: '1.0rem 1.5rem',
                borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
                backgroundColor: 'var(--bg-surface-1, #161e2e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </OverlayPortal>
  );
}
