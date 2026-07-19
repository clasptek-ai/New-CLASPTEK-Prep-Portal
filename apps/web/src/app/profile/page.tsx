import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { ProfileScreen } from '../../features/profile/profile-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <ProfileScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
