'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { MockResultsScreen } from '../../../features/instructor/mock-results/mock-results-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <MockResultsScreen />
    </WorkspaceShell>
  );
}
