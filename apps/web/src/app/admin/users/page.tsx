'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { UsersScreen } from '../../../features/admin/users/users-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <UsersScreen />
    </WorkspaceShell>
  );
}
