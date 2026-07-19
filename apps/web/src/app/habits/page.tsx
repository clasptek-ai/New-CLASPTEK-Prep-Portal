import { WorkspaceShell } from '../../workspace/WorkspaceShell';
import { StudentWorkspaceProvider } from '../../workspace/StudentWorkspaceContext';
import { HabitScreen } from '../../features/habits/habits-screen';

export default function Page() {
  return (
    <StudentWorkspaceProvider>
      <WorkspaceShell workspaceRole="STUDENT">
        <HabitScreen />
      </WorkspaceShell>
    </StudentWorkspaceProvider>
  );
}
