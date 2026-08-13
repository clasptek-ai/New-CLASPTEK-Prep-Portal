'use client';

import React from 'react';
import { WorkspaceShell } from '@/workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '@/workspace/StudentWorkspaceContext';

export interface StudentPortalShellProps {
  children: React.ReactNode;
}

/**
 * Canonical Student Portal Shell.
 * Provides the shared Student Workspace Context and unified WorkspaceShell navigation.
 */
export function StudentPortalShell({ children }: StudentPortalShellProps) {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">{children}</WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}

export default StudentPortalShell;
