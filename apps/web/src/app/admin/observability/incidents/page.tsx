'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { IncidentWorkspace } from '../../../../features/admin/observability/incident-workspace';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <IncidentWorkspace />
    </WorkspaceShell>
  );
}
