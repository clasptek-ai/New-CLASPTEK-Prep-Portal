export interface AdminNavigationItem {
  name: string;
  href: string;
  icon: string;
}

export const adminNavigation: AdminNavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { name: 'Exams', href: '/admin/programmes', icon: 'BookOpen' },
  { name: 'Question Bank', href: '/admin/question-bank', icon: 'Database' },
  { name: 'Practice Sessions', href: '/admin/practice-sessions', icon: 'Layers' },
  { name: 'Diagnostics', href: '/admin/assessments?mode=assessment', icon: 'Award' },
  { name: 'Mock Exams', href: '/admin/assessments?mode=mock', icon: 'Award' },
  { name: 'Students', href: '/admin/students', icon: 'Users' },
  { name: 'Reports', href: '/admin/results', icon: 'BarChart3' },
  { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
  { name: 'Audit Logs', href: '/admin/audit', icon: 'ShieldCheck' },
];
