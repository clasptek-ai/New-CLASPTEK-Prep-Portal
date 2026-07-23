import React from 'react';
import { SyncIndicatorProps } from './status.types';
import { StatusBadge } from './StatusBadge';

export function SyncIndicator({ isSyncing, lastSyncedAt }: SyncIndicatorProps) {
  if (isSyncing) {
    return <StatusBadge variant="info" label="Syncing..." />;
  }

  return (
    <StatusBadge variant="success" label={lastSyncedAt ? `Synced ${lastSyncedAt}` : 'Synced'} />
  );
}
