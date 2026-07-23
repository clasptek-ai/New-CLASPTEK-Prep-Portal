export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

export const studentNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Learning', href: '/learning', icon: 'GraduationCap' },
  { name: 'Practice', href: '/practice', icon: 'Zap' },
  { name: 'Mock Exams', href: '/assessments', icon: 'FileText' },
  { name: 'Results', href: '/results', icon: 'TrendingUp' },
  { name: 'Profile', href: '/profile', icon: 'UserSettings' },
];
