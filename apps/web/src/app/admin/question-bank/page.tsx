'use client';

import React from 'react';
import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { QuestionBankScreen } from '../../../features/admin/question-bank/question-bank-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <QuestionBankScreen />
    </WorkspaceShell>
  );
}
