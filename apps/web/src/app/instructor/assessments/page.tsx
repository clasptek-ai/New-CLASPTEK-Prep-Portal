import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AssessmentsScreen } from '../../../features/instructor/assessments/assessments-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <AssessmentsScreen />
    </WorkspaceShell>
  );
}
