import React from 'react';
import { TextProps } from './Text.types';

export function Text({ variant = 'body-md', style, children, ...props }: TextProps) {
  const getStyle = () => {
    switch (variant) {
      case 'body-sm':
        return { fontSize: '0.8125rem', color: 'var(--text-secondary, #cbd5e1)', fontWeight: 400 };
      case 'muted':
        return { fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 400 };
      case 'strong':
        return { fontSize: '0.875rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 600 };
      default:
        return { fontSize: '0.875rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 400 };
    }
  };

  return (
    <p
      style={{
        margin: 0,
        lineHeight: 1.5,
        ...getStyle(),
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}
