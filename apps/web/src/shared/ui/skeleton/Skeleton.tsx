import React, { forwardRef } from 'react';
import { SkeletonProps } from './skeleton.types';

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width = '100%', height = '1.25rem', borderRadius = 'var(--radius-md, 8px)', style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-surface-2, #1e293b)',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
      {...props}
    />
  );
});
