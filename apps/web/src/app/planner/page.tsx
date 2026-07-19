import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { PlannerScreen } from '../../features/planner/planner-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <PlannerScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
