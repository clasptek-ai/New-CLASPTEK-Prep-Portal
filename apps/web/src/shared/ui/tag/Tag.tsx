import React, { forwardRef } from 'react';
import { TagProps, TagGroupProps } from './tag.types';

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { color = 'var(--primary-500, #3b82f6)', style, children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.5rem',
        borderRadius: 'var(--radius-sm, 6px)',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: 'var(--bg-surface-2, #1e293b)',
        color: 'var(--text-primary, #f8fafc)',
        borderLeft: `3px solid ${color}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
});

export function TagGroup({ style, children, ...props }: TagGroupProps) {
  return (
    <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem', ...style }} {...props}>
      {children}
    </div>
  );
}
