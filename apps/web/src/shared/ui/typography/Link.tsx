import React from 'react';
import { LinkProps } from './Link.types';

export function Link({ external = false, style, children, ...props }: LinkProps) {
  return (
    <a
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{
        color: 'var(--primary-500, #3b82f6)',
        textDecoration: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        transition: 'color 150ms ease',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {children}
    </a>
  );
}
