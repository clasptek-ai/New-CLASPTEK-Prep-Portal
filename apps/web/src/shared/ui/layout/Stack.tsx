import React from 'react';
import { StackProps } from './Stack.types';

export function Stack({
  direction = 'column',
  gap = '1rem',
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  style,
  children,
  ...props
}: StackProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
