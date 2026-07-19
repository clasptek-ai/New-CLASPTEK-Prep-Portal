import React, { use } from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { CohortsScreen } from '../../../../features/instructor/cohorts/cohorts-screen';

interface PageProps {
  params: Promise<{ cohortId: string }>;
}

export default function Page({ params }: PageProps) {
  const { cohortId } = use(params);

  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <CohortsScreen cohortId={cohortId} />
    </WorkspaceShell>
  );
}
