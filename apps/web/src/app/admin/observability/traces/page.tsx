'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { TracesViewScreen } from '../../../../features/admin/observability/traces-view';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <TracesViewScreen />
    </WorkspaceShell>
  );
}
