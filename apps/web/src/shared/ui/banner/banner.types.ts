import React from 'react';

export type BannerVariant = 'info' | 'maintenance' | 'warning' | 'success';

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BannerVariant;
  action?: React.ReactNode;
  onDismiss?: () => void;
  children: React.ReactNode;
}
