'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AssessmentsScreen } from '../../../features/admin/assessments/assessments-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AssessmentsScreen />
    </WorkspaceShell>
  );
}
