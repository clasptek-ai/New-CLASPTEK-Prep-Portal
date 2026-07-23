import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { CurriculumScreen } from '../../../features/instructor/curriculum/curriculum-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="ADMIN">
      <CurriculumScreen />
    </WorkspaceShell>
  );
}
