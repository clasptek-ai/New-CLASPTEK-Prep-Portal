'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { SystemScreen } from '../../../features/admin/system/system-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <SystemScreen />
    </WorkspaceShell>
  );
}
