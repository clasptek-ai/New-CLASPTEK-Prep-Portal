import { StudentPortalShell } from '@/components/student/StudentPortalShell';
import { LearningScreen } from '../../features/learning/learning-screen';

export default function Page() {
  return (
    <StudentPortalShell>
      <LearningScreen />
    </StudentPortalShell>
  );
}
