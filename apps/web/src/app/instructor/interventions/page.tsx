import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { InterventionsScreen } from '../../../features/instructor/interventions/interventions-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <InterventionsScreen />
    </WorkspaceShell>
  );
}
