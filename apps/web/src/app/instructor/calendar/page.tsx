import { WorkspaceShell } from '../../../workspace/WorkspaceShell';
import { CalendarScreen } from '../../../features/instructor/calendar/calendar-screen';

export default function Page() {
  return (
    <WorkspaceShell workspaceRole="INSTRUCTOR">
      <CalendarScreen />
    </WorkspaceShell>
  );
}
