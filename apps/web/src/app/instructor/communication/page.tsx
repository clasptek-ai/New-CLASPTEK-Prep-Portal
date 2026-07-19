import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { CommunicationScreen } from '../../../features/instructor/communication/communication-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <CommunicationScreen />
    </WorkspaceShell>
  );
}
