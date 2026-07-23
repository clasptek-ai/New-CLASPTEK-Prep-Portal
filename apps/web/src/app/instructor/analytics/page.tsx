import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { AnalyticsScreen } from '../../../features/instructor/analytics/analytics-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <AnalyticsScreen />
    </WorkspaceShell>
  );
}
