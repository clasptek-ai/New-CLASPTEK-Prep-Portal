'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { MaintenanceScreen } from '../../../features/admin/maintenance/maintenance-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <MaintenanceScreen />
    </WorkspaceShell>
  );
}
