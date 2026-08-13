import React from 'react';
import { StudentPortalShell } from '@/components/student/StudentPortalShell';

/**
 * Shared Next.js Layout for all /student/* workspace routes.
 * Ensures consistent navigation, sidebar, header, and programme context across student features.
 */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentPortalShell>{children}</StudentPortalShell>;
}
