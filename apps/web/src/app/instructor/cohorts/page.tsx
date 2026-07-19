import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { CohortsScreen } from '../../../features/instructor/cohorts/cohorts-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <CohortsScreen />
    </WorkspaceShell>
  );
}
