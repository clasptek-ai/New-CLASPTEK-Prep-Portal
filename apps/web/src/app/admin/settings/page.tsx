'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { SettingsScreen } from '../../../features/admin/settings/settings-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <SettingsScreen />
    </WorkspaceShell>
  );
}
