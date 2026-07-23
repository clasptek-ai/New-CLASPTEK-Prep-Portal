import React, { forwardRef } from 'react';
import { TextHighlightProps } from './highlight.types';

export const TextHighlight = forwardRef<HTMLSpanElement, TextHighlightProps>(function TextHighlight(
  { color = '#fef08a', style, children, ...props },
  ref
) {
  return (
    <mark
      ref={ref}
      style={{
        backgroundColor: color,
        color: '#0f172a',
        padding: '0.1rem 0.25rem',
        borderRadius: '2px',
        fontWeight: 600,
        ...style,
      }}
      {...props}
    >
      {children}
    </mark>
  );
});

export const SelectionToolbar = TextHighlight;
export const HighlightLegend = TextHighlight;
