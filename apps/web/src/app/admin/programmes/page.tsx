'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { ProgrammesScreen } from '../../../features/admin/programmes/programmes-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <ProgrammesScreen />
    </WorkspaceShell>
  );
}
