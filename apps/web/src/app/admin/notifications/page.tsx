'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { NotificationsScreen } from '../../../features/admin/notifications/notifications-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <NotificationsScreen />
    </WorkspaceShell>
  );
}
