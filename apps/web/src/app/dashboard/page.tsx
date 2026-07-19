import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { DashboardScreen } from '../../features/dashboard/dashboard-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <DashboardScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
