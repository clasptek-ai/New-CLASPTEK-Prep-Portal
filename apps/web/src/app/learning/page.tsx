import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { LearningScreen } from '../../features/learning/learning-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <LearningScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
