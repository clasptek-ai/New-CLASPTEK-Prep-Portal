import { StudentPortalShell } from '@/components/student/StudentPortalShell';
import { ReadinessScreen } from '../../features/readiness/readiness-screen';

export default function Page() {
  return (
    <StudentPortalShell>
      <ReadinessScreen />
    </StudentPortalShell>
  );
}
