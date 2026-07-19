import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { ReadinessScreen } from '../../features/readiness/readiness-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <ReadinessScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
