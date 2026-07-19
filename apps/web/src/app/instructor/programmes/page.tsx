'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { InstructorProgrammesScreen } from '../../../features/instructor/programmes/programmes-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <InstructorProgrammesScreen />
    </WorkspaceShell>
  );
}
