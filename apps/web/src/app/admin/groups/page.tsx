'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { GroupsScreen } from '../../../features/admin/groups/groups-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <GroupsScreen />
    </WorkspaceShell>
  );
}
