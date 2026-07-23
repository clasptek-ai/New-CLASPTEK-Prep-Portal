export interface AdminNavigationItem {
  name: string;
  href: string;
  icon: string;
}

export const adminNavigation: AdminNavigationItem[] = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { name: 'Tenant Organizations', href: '/admin/organizations', icon: 'Building' },
  { name: 'User Directory', href: '/admin/users', icon: 'Users' },
  { name: 'System Roles', href: '/admin/roles', icon: 'Shield' },
  { name: 'Permissions Matrix', href: '/admin/permissions', icon: 'Lock' },
  { name: 'Capability Groups', href: '/admin/groups', icon: 'UserCheck' },
  { name: 'Audit Explorer', href: '/admin/audit', icon: 'History' },
  { name: 'System Monitoring', href: '/admin/system', icon: 'Heart' },
  { name: 'Integrations Registry', href: '/admin/integrations', icon: 'Network' },
  { name: 'Observability Center', href: '/admin/observability', icon: 'Activity' },
  { name: 'Notification Center', href: '/admin/notifications', icon: 'Mail' },
  { name: 'Feature Flags', href: '/admin/feature-flags', icon: 'ToggleLeft' },
  { name: 'Platform Analytics', href: '/admin/analytics', icon: 'BarChart' },
  { name: 'Maintenance Mode', href: '/admin/maintenance', icon: 'Settings' },
  { name: 'Platform Settings', href: '/admin/settings', icon: 'Sliders' },
];
