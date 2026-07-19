'use client';

import React, { use } from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { OrganizationsScreen } from '../../../../features/admin/organizations/organizations-screen';

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default function Page({ params }: PageProps) {
  const { orgId } = use(params);

  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <OrganizationsScreen orgId={orgId} />
    </WorkspaceShell>
  );
}
