import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { CoachScreen } from '../../features/coach/coach-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <CoachScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
