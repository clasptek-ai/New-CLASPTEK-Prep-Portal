import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'offline';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  label: string;
  dot?: boolean;
}

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusVariant;
  size?: number;
}

export interface ConnectionIndicatorProps {
  isOnline: boolean;
}

export interface SyncIndicatorProps {
  isSyncing: boolean;
  lastSyncedAt?: string;
}
