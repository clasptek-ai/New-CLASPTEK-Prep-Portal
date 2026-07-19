import React, { use } from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { AssessmentsScreen } from '../../../../features/instructor/assessments/assessments-screen';

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default function Page({ params }: PageProps) {
  const { assessmentId } = use(params);

  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <AssessmentsScreen assessmentId={assessmentId} />
    </WorkspaceShell>
  );
}
