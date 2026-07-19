'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { FeedbackScreen } from '../../../features/instructor/feedback/feedback-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <FeedbackScreen />
    </WorkspaceShell>
  );
}
