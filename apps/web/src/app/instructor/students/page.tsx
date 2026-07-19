import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { StudentsScreen } from '../../../features/instructor/students/students-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <StudentsScreen />
    </WorkspaceShell>
  );
}
