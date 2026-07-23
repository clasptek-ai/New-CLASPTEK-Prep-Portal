'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { ReadinessScreen } from '../../../features/instructor/readiness/readiness-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <ReadinessScreen />
    </WorkspaceShell>
  );
}
