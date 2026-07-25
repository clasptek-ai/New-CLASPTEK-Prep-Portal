export type WorkspaceId = 'STUDENT' | 'ADMIN';

export interface WorkspaceNavigationItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  requiredPermission?: string;
}

export interface WorkspaceDefinition {
  id: WorkspaceId;
  name: string;
  themeAccent: string;
  defaultRoute: string;
  navigation: WorkspaceNavigationItem[];
  searchScope: string;
  permissions: string[];
}

export const workspaceRegistry: Record<WorkspaceId, WorkspaceDefinition> = {
  STUDENT: {
    id: 'STUDENT',
    name: 'Student Portal',
    themeAccent: '#2563eb',
    defaultRoute: '/dashboard',
    searchScope: 'STUDENT',
    permissions: [],
    navigation: [
      { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { name: 'Learning', href: '/learning', icon: 'GraduationCap' },
      { name: 'Practice', href: '/practice', icon: 'Zap' },
      { name: 'Assessments', href: '/student/assessments', icon: 'FileText' },
      { name: 'Mock Tests', href: '/student/mock', icon: 'BookOpen' },
      { name: 'AI Coach', href: '/learning-assistant', icon: 'Sparkles' },
      { name: 'Calendar', href: '/student/calendar', icon: 'Calendar' },
      { name: 'Results', href: '/results', icon: 'TrendingUp' },
      { name: 'Settings', href: '/account', icon: 'Settings' },
    ],
  },
  ADMIN: {
    id: 'ADMIN',
    name: 'Platform Administration Console',
    themeAccent: '#ec4899',
    defaultRoute: '/admin/dashboard',
    searchScope: 'ADMIN',
    permissions: ['*'],
    navigation: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
      { name: 'Users', href: '/admin/users', icon: 'Users' },
      { name: 'Courses & Curriculum', href: '/admin/curriculum', icon: 'BookOpen' },
      { name: 'Question Bank', href: '/admin/question-bank', icon: 'Shield' },
      { name: 'Assessments', href: '/admin/assessments', icon: 'FileText' },
      { name: 'Assessment Reviews', href: '/admin/assessment-reviews', icon: 'Award' },
      { name: 'Mock Exams', href: '/admin/assessments?type=mock', icon: 'BookOpen' },
      { name: 'Media & Resources', href: '/admin/resources', icon: 'Library' },
      { name: 'Analytics', href: '/admin/analytics', icon: 'LineChart' },
      { name: 'Reports', href: '/admin/reports', icon: 'FileBarChart' },
      { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
    ],
  },
};

export function getWorkspace(id: WorkspaceId): WorkspaceDefinition {
  return workspaceRegistry[id] || workspaceRegistry.STUDENT;
}
export default workspaceRegistry;
