import React from 'react';

export type BadgeVariant =
  'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export interface NotificationBadgeProps {
  count?: number;
  max?: number;
  dot?: boolean;
  children: React.ReactNode;
}
