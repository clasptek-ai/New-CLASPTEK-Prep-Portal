'use client';

import React, { use } from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { UsersScreen } from '../../../../features/admin/users/users-screen';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function Page({ params }: PageProps) {
  const { userId } = use(params);

  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <UsersScreen userId={userId} />
    </WorkspaceShell>
  );
}
