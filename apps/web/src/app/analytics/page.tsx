import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { AnalyticsScreen } from '../../features/analytics/analytics-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <AnalyticsScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
