import React from 'react';
import { LabelProps } from './Label.types';

export function Label({ required = false, style, children, ...props }: LabelProps) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--text-primary, #f8fafc)',
        marginBottom: '0.35rem',
        ...style,
      }}
      {...props}
    >
      {children}
      {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
    </label>
  );
}
