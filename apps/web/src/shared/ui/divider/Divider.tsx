import React from 'react';
import { DividerProps } from './Divider.types';

export function Divider({
  orientation = 'horizontal',
  margin = '1rem 0',
  style,
  ...props
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      style={{
        width: isHorizontal ? '100%' : '1px',
        height: isHorizontal ? '1px' : '100%',
        margin: isHorizontal ? margin : '0 1rem',
        backgroundColor: 'var(--border-subtle, rgba(255, 255, 255, 0.08))',
        ...style,
      }}
      {...props}
    />
  );
}
