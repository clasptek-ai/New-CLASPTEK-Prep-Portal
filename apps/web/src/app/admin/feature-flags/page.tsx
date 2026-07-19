'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { FeatureFlagsScreen } from '../../../features/admin/feature-flags/feature-flags-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <FeatureFlagsScreen />
    </WorkspaceShell>
  );
}
