export interface AdminNavigationItem {
  name: string;
  href: string;
  icon: string;
}

export const adminNavigation: AdminNavigationItem[] = [
  // OVERVIEW
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  // LEARNING
  { name: 'Assessments', href: '/admin/assessments', icon: 'ClipboardList' },
  { name: 'Question Bank', href: '/admin/question-bank', icon: 'Database' },
  { name: 'Programmes', href: '/admin/programmes', icon: 'BookOpen' },
  { name: 'Curriculum', href: '/admin/curriculum', icon: 'Library' },
  { name: 'Practice Sessions', href: '/admin/practice-sessions', icon: 'Dumbbell' },
  { name: 'Builders', href: '/admin/builders', icon: 'Hammer' },
  // PEOPLE
  { name: 'Users', href: '/admin/users', icon: 'Users' },
  // OPERATIONS
  { name: 'Attempt Review', href: '/admin/attempt-review', icon: 'FileSearch' },
  { name: 'Assessment Reviews', href: '/admin/assessment-reviews', icon: 'CheckSquare' },
  { name: 'Notifications', href: '/admin/notifications', icon: 'Bell' },
  // SYSTEM
  { name: 'Integrations', href: '/admin/integrations', icon: 'Plug' },
  { name: 'Observability', href: '/admin/observability', icon: 'Activity' },
  { name: 'Audit', href: '/admin/audit', icon: 'ShieldCheck' },
  { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
];
