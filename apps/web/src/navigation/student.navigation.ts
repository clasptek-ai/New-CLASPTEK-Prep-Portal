export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

export const studentNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'AI Coach', href: '/coach', icon: 'Bot' },
  { name: 'Study Planner', href: '/planner', icon: 'CalendarDays' },
  { name: 'My Goals', href: '/goals', icon: 'Target' },
  { name: 'Habits', href: '/habits', icon: 'Flame' },
  { name: 'Reflection Journal', href: '/journal', icon: 'BookOpen' },
  { name: 'Learning Journey', href: '/journey', icon: 'Compass' },
  { name: 'Adaptive Practice', href: '/practice', icon: 'Zap' },
  { name: 'Assessments', href: '/assessments', icon: 'FileText' },
  { name: 'Analytics', href: '/analytics', icon: 'TrendingUp' },
  { name: 'Resources', href: '/resources', icon: 'BookMarked' },
  { name: 'Profile', href: '/profile', icon: 'UserSettings' }
];
