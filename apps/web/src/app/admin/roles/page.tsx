'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { RolesScreen } from '../../../features/admin/roles/roles-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <RolesScreen />
    </WorkspaceShell>
  );
}
