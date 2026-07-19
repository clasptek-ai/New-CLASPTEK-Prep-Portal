'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { LogsScreen } from '../../../../features/admin/integrations/logs-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <LogsScreen />
    </WorkspaceShell>
  );
}
