import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { QuestionBankScreen } from '../../../features/instructor/question-bank/question-bank-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <QuestionBankScreen />
    </WorkspaceShell>
  );
}
