'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { SubmissionsScreen } from '../../../features/instructor/submissions/submissions-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <SubmissionsScreen />
    </WorkspaceShell>
  );
}
