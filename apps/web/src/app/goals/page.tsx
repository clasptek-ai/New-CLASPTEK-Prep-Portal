import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { GoalsScreen } from '../../features/goals/goals-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <GoalsScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
