import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { SettingsScreen } from '../../../features/instructor/settings/settings-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <SettingsScreen />
    </WorkspaceShell>
  );
}
