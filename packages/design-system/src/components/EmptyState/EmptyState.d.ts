import React from 'react';
export interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}
export declare const EmptyState: React.FC<EmptyStateProps>;
