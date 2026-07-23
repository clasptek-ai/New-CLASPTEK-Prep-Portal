import React from 'react';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number | string;
  gap?: string;
  children: React.ReactNode;
}
