'use client';

import React from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { WebhooksScreen } from '../../../../features/admin/integrations/webhooks-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <WebhooksScreen />
    </WorkspaceShell>
  );
}
