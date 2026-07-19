'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { OperationsDashboardScreen } from '../../../features/admin/observability/dashboard';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <OperationsDashboardScreen />
    </WorkspaceShell>
  );
}
