'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { PerformanceScreen } from '../../../../features/admin/observability/performance';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <PerformanceScreen />
    </WorkspaceShell>
  );
}
