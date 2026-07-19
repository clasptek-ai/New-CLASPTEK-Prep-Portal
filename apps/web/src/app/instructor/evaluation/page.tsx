import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { EvaluationScreen } from '../../../features/instructor/evaluation/evaluation-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <EvaluationScreen />
    </WorkspaceShell>
  );
}
