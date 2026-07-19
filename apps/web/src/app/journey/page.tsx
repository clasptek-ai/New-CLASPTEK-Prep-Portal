import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { LearningJourneyScreen } from '../../features/journey/journey-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <LearningJourneyScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
