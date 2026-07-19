import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { AssignmentsScreen } from '../../features/assignments/assignments-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <AssignmentsScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
