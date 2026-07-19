'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { ResourcesScreen } from '../../../features/admin/resources/resources-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <ResourcesScreen />
    </WorkspaceShell>
  );
}
