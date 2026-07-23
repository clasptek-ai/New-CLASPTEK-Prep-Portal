import React from 'react';
import { PopoverProps } from './tooltip.types';

export function Popover({ content, isOpen, onClose: _onClose, children }: PopoverProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'var(--bg-surface-0, #111827)',
            border: '1px solid var(--border-default, #1e293b)',
            borderRadius: 'var(--radius-lg, 12px)',
            boxShadow: 'var(--shadow-xl)',
            padding: '1.0rem',
            zIndex: 1500,
            minWidth: '220px',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
