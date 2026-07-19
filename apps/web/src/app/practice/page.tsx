import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { AdaptivePracticeScreen } from '../../features/practice/practice-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <AdaptivePracticeScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
