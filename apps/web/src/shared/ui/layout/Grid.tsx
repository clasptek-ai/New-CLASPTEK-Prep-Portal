import React from 'react';
import { GridProps } from './Grid.types';

export function Grid({ columns = 12, gap = '1.5rem', style, children, ...props }: GridProps) {
  const gridTemplateColumns =
    typeof columns === 'number' ? `repeat(${columns}, minmax(0, 1fr))` : columns;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap,
        width: '100%',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
