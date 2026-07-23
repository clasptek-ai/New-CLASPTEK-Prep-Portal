export interface AuthoringNavigationItem {
  name: string;
  href: string;
  icon: string;
}

export const authoringNavigation: AuthoringNavigationItem[] = [
  { name: 'Studio Dashboard', href: '/authoring/dashboard', icon: 'LayoutDashboard' },
  { name: 'Working Drafts', href: '/authoring/drafts', icon: 'FileEdit' },
  { name: 'Programmes Studio', href: '/authoring/programmes', icon: 'GraduationCap' },
  { name: 'Curriculum Builder', href: '/authoring/curriculum', icon: 'ListOrdered' },
  { name: 'Question Bank Studio', href: '/authoring/question-bank', icon: 'Database' },
  { name: 'Learning Resources', href: '/authoring/learning-resources', icon: 'Library' },
  { name: 'Assessment Builder', href: '/authoring/assessments', icon: 'BookOpen' },
  { name: 'Content Reviews', href: '/authoring/reviews', icon: 'ClipboardCheck' },
  { name: 'Publishing Center', href: '/authoring/publishing', icon: 'Send' },
  { name: 'Studio Analytics', href: '/authoring/analytics', icon: 'LineChart' },
  { name: 'Import Center', href: '/authoring/imports', icon: 'Upload' },
  { name: 'Export Center', href: '/authoring/exports', icon: 'Download' },
  { name: 'Audit Logs', href: '/authoring/audit', icon: 'History' },
  { name: 'Studio Settings', href: '/authoring/settings', icon: 'Settings' },
];
