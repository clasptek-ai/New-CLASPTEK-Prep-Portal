import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive' | 'compact' | 'glass' | 'flat';
export type CardPadding = 'none' | 'compact' | 'default' | 'loose';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Padding preset. Use CSS `style={{ padding: '...' }}` for custom overrides. */
  padding?: CardPadding;
  children: React.ReactNode;
}

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'raised' | 'floating';
  children: React.ReactNode;
}
