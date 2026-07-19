'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { AlertCenterScreen } from '../../../../features/admin/observability/alert-center';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AlertCenterScreen />
    </WorkspaceShell>
  );
}
