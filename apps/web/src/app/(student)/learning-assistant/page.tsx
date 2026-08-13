import { AICoachScreen } from '@/features/learning-intelligence/presentation/ai-coach-screen';
import { StudentPortalShell } from '@/components/student/StudentPortalShell';

export default function LearningAssistantPage() {
  return (
    <StudentPortalShell>
      <AICoachScreen />
    </StudentPortalShell>
  );
}
