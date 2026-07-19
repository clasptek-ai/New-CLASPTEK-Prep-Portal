'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AuditScreen } from '../../../features/admin/audit/audit-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AuditScreen />
    </WorkspaceShell>
  );
}
