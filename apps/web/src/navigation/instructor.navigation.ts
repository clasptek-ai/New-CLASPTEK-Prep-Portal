export interface InstructorNavigationItem {
  name: string;
  href: string;
  icon: string;
  requiredPermission?: string;
}

export const instructorNavigation: InstructorNavigationItem[] = [
  { name: 'Dashboard', href: '/instructor/dashboard', icon: 'LayoutDashboard' },
  { name: 'Student Directory', href: '/instructor/students', icon: 'Users' },
  {
    name: 'Cohort Management',
    href: '/instructor/cohorts',
    icon: 'FolderGit',
    requiredPermission: 'MANAGE_COHORTS',
  },
  {
    name: 'Assessment Library',
    href: '/instructor/assessments',
    icon: 'BookOpen',
    requiredPermission: 'MANAGE_ASSESSMENTS',
  },
  {
    name: 'AI Evaluations',
    href: '/instructor/evaluation',
    icon: 'FileCheck',
    requiredPermission: 'OVERRIDE_AI_SCORES',
  },
  { name: 'Question Bank', href: '/instructor/question-bank', icon: 'Database' },
  { name: 'Curriculum Sequences', href: '/instructor/curriculum', icon: 'ListOrdered' },
  { name: 'Teaching Resources', href: '/instructor/resources', icon: 'Library' },
  {
    name: 'Analytics Workspace',
    href: '/instructor/analytics',
    icon: 'LineChart',
    requiredPermission: 'VIEW_ANALYTICS',
  },
  { name: 'Interventions Center', href: '/instructor/interventions', icon: 'ShieldAlert' },
  { name: 'Communication Hub', href: '/instructor/communication', icon: 'Mail' },
  { name: 'Teaching Calendar', href: '/instructor/calendar', icon: 'Calendar' },
  {
    name: 'Generated Reports',
    href: '/instructor/reports',
    icon: 'FileBarChart',
    requiredPermission: 'EXPORT_REPORTS',
  },
  { name: 'Workspace Settings', href: '/instructor/settings', icon: 'Settings' },
];
