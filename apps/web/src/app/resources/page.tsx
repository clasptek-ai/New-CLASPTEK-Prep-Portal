import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { ResourcesScreen } from '../../features/resources/resources-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <ResourcesScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
