import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { ResourcesScreen } from '../../../features/instructor/resources/resources-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <ResourcesScreen />
    </WorkspaceShell>
  );
}
