'use client';

import React, { use } from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { ConnectionWorkspace } from '../../../../features/admin/integrations/connection-workspace';

interface PageProps {
  params: Promise<{ connectionId: string }>;
}

export default function Page({ params }: PageProps) {
  const { connectionId } = use(params);

  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <ConnectionWorkspace connectionId={connectionId} />
    </WorkspaceShell>
  );
}
