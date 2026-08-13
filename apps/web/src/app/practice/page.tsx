import { StudentPortalShell } from '@/components/student/StudentPortalShell';
import { AdaptivePracticeScreen } from '../../features/practice/practice-screen';

export default function Page() {
  return (
    <StudentPortalShell>
      <AdaptivePracticeScreen />
    </StudentPortalShell>
  );
}
