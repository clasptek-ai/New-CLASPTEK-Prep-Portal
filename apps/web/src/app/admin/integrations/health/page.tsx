'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { HealthScreen } from '../../../../features/admin/integrations/health-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <HealthScreen />
    </WorkspaceShell>
  );
}
