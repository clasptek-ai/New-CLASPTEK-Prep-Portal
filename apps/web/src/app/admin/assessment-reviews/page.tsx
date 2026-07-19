'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AssessmentReviewsScreen } from '../../../features/admin/assessment-reviews/reviews-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AssessmentReviewsScreen />
    </WorkspaceShell>
  );
}
