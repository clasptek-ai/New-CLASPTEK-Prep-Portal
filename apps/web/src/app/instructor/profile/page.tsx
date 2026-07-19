'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { ProfileScreen } from '../../../features/instructor/profile/profile-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <ProfileScreen />
    </WorkspaceShell>
  );
}
