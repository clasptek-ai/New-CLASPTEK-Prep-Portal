'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { MetricsExplorerScreen } from '../../../../features/admin/observability/metrics-explorer';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <MetricsExplorerScreen />
    </WorkspaceShell>
  );
}
