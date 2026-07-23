import React from 'react';
import { ConnectionIndicatorProps } from './status.types';
import { StatusBadge } from './StatusBadge';

export function ConnectionIndicator({ isOnline }: ConnectionIndicatorProps) {
  return (
    <StatusBadge
      variant={isOnline ? 'success' : 'offline'}
      label={isOnline ? 'Online' : 'Offline'}
    />
  );
}
