'use client';

import React, { use } from 'react';
import { WorkspaceShell } from '../../../../../workspace/WorkspaceShell';
import { IncidentWorkspace } from '../../../../../features/admin/observability/incident-workspace';

interface PageProps {
  params: Promise<{ incidentId: string }>;
}

export default function Page({ params }: PageProps) {
  const { incidentId } = use(params);

  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <IncidentWorkspace incidentId={incidentId} />
    </WorkspaceShell>
  );
}
