import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { ReportsScreen } from '../../../features/instructor/reports/reports-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <ReportsScreen />
    </WorkspaceShell>
  );
}
