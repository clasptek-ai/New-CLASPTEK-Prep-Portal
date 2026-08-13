'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { ReportsScreen } from '../../../../features/admin/observability/reports';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <ReportsScreen />
    </WorkspaceShell>
  );
}
