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
      { name: 'Pre-Assessment', href: '/student/assessments', icon: 'FileText' },
      { name: 'Practice', href: '/practice', icon: 'Zap' },
      { name: 'Mock Exams', href: '/student/mock', icon: 'BookOpen' },
      { name: 'Results & Analytics', href: '/student/results', icon: 'FileBarChart' },
      { name: 'Profile', href: '/profile', icon: 'User' },
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
    ],
  },
};

export function getWorkspace(id: WorkspaceId): WorkspaceDefinition {
  return workspaceRegistry[id] || workspaceRegistry.STUDENT;
}
export default workspaceRegistry;
