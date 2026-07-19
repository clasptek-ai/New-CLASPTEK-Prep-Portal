import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { NotificationsScreen } from '../../features/notifications/notifications-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <NotificationsScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
