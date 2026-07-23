'use client';

import React, { use } from 'react';
import { WorkspaceShell } from '../../../../workspace/WorkspaceShell';
import { StudentsScreen } from '../../../../features/instructor/students/students-screen';

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default function Page({ params }: PageProps) {
  const { studentId } = use(params);

  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <StudentsScreen studentId={studentId} />
    </WorkspaceShell>
  );
}
