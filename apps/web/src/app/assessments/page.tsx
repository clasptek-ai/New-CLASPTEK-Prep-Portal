import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { AssessmentPlayerScreen } from '../../features/assessments/assessment-player';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <AssessmentPlayerScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
