'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { LogsExplorerScreen } from '../../../../features/admin/observability/logs-explorer';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <LogsExplorerScreen />
    </WorkspaceShell>
  );
}
