import React from 'react';

export interface TextHighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  children: React.ReactNode;
}
