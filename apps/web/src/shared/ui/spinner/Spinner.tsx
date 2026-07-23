import React, { forwardRef } from 'react';
import { SpinnerProps } from './spinner.types';

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  { size = 'md', color = 'var(--primary-500, #3b82f6)', style, ...props },
  ref
) {
  const getSizePx = () => {
    switch (size) {
      case 'sm':
        return '1.0rem';
      case 'lg':
        return '2.0rem';
      case 'xl':
        return '3.0rem';
      default:
        return '1.5rem';
    }
  };

  const dim = getSizePx();

  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      style={{
        width: dim,
        height: dim,
        border: '2px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        display: 'inline-block',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    />
  );
});
