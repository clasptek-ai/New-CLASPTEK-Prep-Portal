import { Suspense } from 'react';
import { StudentPortalShell } from '@/components/student/StudentPortalShell';
import { AdaptivePracticeScreen } from '../../features/practice/practice-screen';

export default function Page() {
  return (
    <StudentPortalShell>
      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-500">Loading Practice Workspace...</div>
        }
      >
        <AdaptivePracticeScreen />
      </Suspense>
    </StudentPortalShell>
  );
}
