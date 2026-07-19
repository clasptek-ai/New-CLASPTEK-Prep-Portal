import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { IntegrationsScreen } from '../../../features/admin/integrations/integrations-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <IntegrationsScreen />
    </WorkspaceShell>
  );
}
