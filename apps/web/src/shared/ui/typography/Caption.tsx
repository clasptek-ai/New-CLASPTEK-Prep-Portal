import React from 'react';
import { CaptionProps } from './Caption.types';

export function Caption({ style, children, ...props }: CaptionProps) {
  return (
    <span
      style={{
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'var(--text-muted, #94a3b8)',
        letterSpacing: '0.02em',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
