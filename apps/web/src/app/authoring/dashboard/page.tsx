'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AuthoringDashboardScreen } from '../../../features/authoring/dashboard/dashboard-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="AUTHORING">
      <AuthoringDashboardScreen />
    </WorkspaceShell>
  );
}
