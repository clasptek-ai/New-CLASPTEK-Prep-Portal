'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { PermissionsScreen } from '../../../features/admin/permissions/permissions-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <PermissionsScreen />
    </WorkspaceShell>
  );
}
