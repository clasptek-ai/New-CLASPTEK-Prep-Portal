import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive' | 'compact';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: string;
  children: React.ReactNode;
}

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'raised' | 'floating';
  children: React.ReactNode;
}
