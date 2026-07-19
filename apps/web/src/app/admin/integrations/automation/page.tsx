'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { AutomationScreen } from '../../../../features/admin/integrations/automation-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AutomationScreen />
    </WorkspaceShell>
  );
}
