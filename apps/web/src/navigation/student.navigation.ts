export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

export const studentNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Practice', href: '/student/practice', icon: 'Zap' },
  { name: 'Diagnostics', href: '/student/assessments', icon: 'FileText' },
  { name: 'Mock Exams', href: '/student/mock', icon: 'BookOpen' },
  { name: 'AI Coach', href: '/learning-assistant', icon: 'Sparkles' },
  { name: 'Readiness', href: '/readiness', icon: 'TrendingUp' },
  { name: 'Results', href: '/student/results', icon: 'FileBarChart' },
  { name: 'Settings', href: '/profile', icon: 'Settings' },
];
