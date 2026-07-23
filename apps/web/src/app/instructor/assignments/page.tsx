'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AssignmentsScreen } from '../../../features/instructor/assignments/assignments-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AssignmentsScreen />
    </WorkspaceShell>
  );
}
