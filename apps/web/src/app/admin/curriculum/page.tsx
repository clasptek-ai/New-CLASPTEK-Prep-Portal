'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { CurriculumScreen } from '../../../features/admin/curriculum/curriculum-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <CurriculumScreen />
    </WorkspaceShell>
  );
}
