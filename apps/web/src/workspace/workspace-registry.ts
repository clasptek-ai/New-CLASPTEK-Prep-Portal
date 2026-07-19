export type WorkspaceId = 'STUDENT' | 'INSTRUCTOR' | 'AUTHORING' | 'ADMIN';

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
      { name: 'My Learning', href: '/learning', icon: 'GraduationCap' },
      { name: 'Practice', href: '/practice', icon: 'Zap' },
      { name: 'Assignments', href: '/assignments', icon: 'FileEdit' },
      { name: 'Mock Exams', href: '/assessments', icon: 'BookOpen' },
      { name: 'Learning Resources', href: '/resources', icon: 'Library' },
      { name: 'AI Coach', href: '/coach', icon: 'Bot' },
      { name: 'Readiness', href: '/readiness', icon: 'LineChart' },
      { name: 'Notifications', href: '/notifications', icon: 'Mail' },
      { name: 'Profile', href: '/profile', icon: 'UserSettings' }
    ]
  },
  INSTRUCTOR: {
    id: 'INSTRUCTOR',
    name: 'Instructor Workspace',
    themeAccent: '#14b8a6',
    defaultRoute: '/instructor/dashboard',
    searchScope: 'INSTRUCTOR',
    permissions: ['VIEW_ANALYTICS', 'MANAGE_ASSESSMENTS'],
    navigation: [
      { name: 'Dashboard', href: '/instructor/dashboard', icon: 'LayoutDashboard' },
      { name: 'My Programmes', href: '/instructor/programmes', icon: 'GraduationCap' },
      { name: 'My Students', href: '/instructor/students', icon: 'Users' },
      { name: 'Assignments', href: '/instructor/assignments', icon: 'FileEdit' },
      { name: 'Submissions', href: '/instructor/submissions', icon: 'FileCheck' },
      { name: 'Learning Resources', href: '/instructor/resources', icon: 'Library' },
      { name: 'Practice Analytics', href: '/instructor/analytics', icon: 'LineChart' },
      { name: 'Mock Results', href: '/instructor/mock-results', icon: 'BookOpen' },
      { name: 'Student Readiness', href: '/instructor/student-readiness', icon: 'ShieldAlert' },
      { name: 'Instructor Notes', href: '/instructor/instructor-notes', icon: 'History' },
      { name: 'Profile', href: '/instructor/profile', icon: 'Sliders' }
    ]
  },
  AUTHORING: {
    id: 'AUTHORING',
    name: 'Academic Authoring Studio',
    themeAccent: '#10b981',
    defaultRoute: '/authoring/dashboard',
    searchScope: 'AUTHORING',
    permissions: ['*'],
    navigation: [
      { name: 'Studio Dashboard', href: '/authoring/dashboard', icon: 'LayoutDashboard' },
      { name: 'Working Drafts', href: '/authoring/drafts', icon: 'FileEdit' },
      { name: 'Programmes Studio', href: '/authoring/programmes', icon: 'GraduationCap' }
    ]
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
      { name: 'Programmes', href: '/admin/programmes', icon: 'GraduationCap' },
      { name: 'Curriculum', href: '/admin/curriculum', icon: 'BookOpen' },
      { name: 'Assessments', href: '/admin/assessments', icon: 'FileText' },
      { name: 'Assessment Reviews', href: '/admin/assessment-reviews', icon: 'History' },
      { name: 'Question Bank', href: '/admin/question-bank', icon: 'Shield' },
      { name: 'Learning Resources', href: '/admin/resources', icon: 'Library' },
      { name: 'Reports', href: '/admin/reports', icon: 'LineChart' },
      { name: 'Audit Logs', href: '/admin/audit', icon: 'Lock' },
      { name: 'Settings', href: '/admin/settings', icon: 'Sliders' }
    ]
  }
};

export function getWorkspace(id: WorkspaceId): WorkspaceDefinition {
  return workspaceRegistry[id];
}
export default workspaceRegistry;
