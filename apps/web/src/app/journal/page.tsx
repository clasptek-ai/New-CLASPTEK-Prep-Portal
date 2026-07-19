import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { JournalScreen } from '../../features/journal/journal-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <JournalScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
