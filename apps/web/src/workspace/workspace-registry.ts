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
      { name: 'Practice', href: '/student/practice', icon: 'Zap' },
      { name: 'Diagnostics', href: '/student/assessments', icon: 'FileText' },
      { name: 'Mock Exams', href: '/student/mock', icon: 'BookOpen' },
      { name: 'AI Coach', href: '/learning-assistant', icon: 'Sparkles' },
      { name: 'Readiness', href: '/readiness', icon: 'TrendingUp' },
      { name: 'Results', href: '/student/results', icon: 'FileBarChart' },
      { name: 'Settings', href: '/profile', icon: 'Settings' },
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
      { name: 'Exams & Programmes', href: '/admin/programmes', icon: 'BookOpen' },
      { name: 'Question Bank', href: '/admin/question-bank', icon: 'Shield' },
      { name: 'Bulk Import', href: '/admin/question-bank/import', icon: 'Upload' },
      { name: 'Assessments', href: '/admin/assessments', icon: 'FileText' },
      { name: 'Mock Exams', href: '/admin/assessments?mode=mock', icon: 'BookOpen' },
      { name: 'Student Directory', href: '/admin/students', icon: 'Users' },
      { name: 'Results & Analytics', href: '/admin/results', icon: 'LineChart' },
      { name: 'Platform Settings', href: '/admin/settings', icon: 'Settings' },
    ],
  },
};

export function getWorkspace(id: WorkspaceId): WorkspaceDefinition {
  return workspaceRegistry[id] || workspaceRegistry.STUDENT;
}
export default workspaceRegistry;
