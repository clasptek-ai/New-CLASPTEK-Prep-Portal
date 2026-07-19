'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AdminDashboardScreen } from '../../../features/admin/dashboard/dashboard-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AdminDashboardScreen />
    </WorkspaceShell>
  );
}
