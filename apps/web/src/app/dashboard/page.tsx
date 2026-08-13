import { StudentPortalShell } from '@/components/student/StudentPortalShell';
import { DashboardScreen } from '../../features/dashboard/dashboard-screen';

export default function Page() {
  return (
    <StudentPortalShell>
      <DashboardScreen />
    </StudentPortalShell>
  );
}
