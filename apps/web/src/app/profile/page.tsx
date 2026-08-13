import { StudentPortalShell } from '@/components/student/StudentPortalShell';
import { ProfileScreen } from '../../features/profile/profile-screen';

export default function Page() {
  return (
    <StudentPortalShell>
      <ProfileScreen />
    </StudentPortalShell>
  );
}
