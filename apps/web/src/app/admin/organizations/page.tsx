'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { OrganizationsScreen } from '../../../features/admin/organizations/organizations-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <OrganizationsScreen />
    </WorkspaceShell>
  );
}
