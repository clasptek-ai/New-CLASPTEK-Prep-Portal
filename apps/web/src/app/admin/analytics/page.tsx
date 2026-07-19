'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AnalyticsScreen } from '../../../features/admin/analytics/analytics-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AnalyticsScreen />
    </WorkspaceShell>
  );
}
