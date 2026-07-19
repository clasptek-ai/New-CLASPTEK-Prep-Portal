'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { InstructorDashboardScreen } from '../../../features/instructor/dashboard/dashboard-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <InstructorDashboardScreen />
    </WorkspaceShell>
  );
}
