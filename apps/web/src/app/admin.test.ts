import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/admin/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn(),
    }),
    use: (promise: any) => {
      return { orgId: 'o1', userId: 'u1' };
    },
  };
});

vi.mock('../providers/theme-provider', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
      theme: 'dark',
      setTheme: vi.fn(),
    }),
  };
});

import { adminNavigation } from '../navigation/admin.navigation';
import { AdminDashboardScreen } from '../features/admin/dashboard/dashboard-screen';
import { OrganizationsScreen } from '../features/admin/organizations/organizations-screen';
import { UsersScreen } from '../features/admin/users/users-screen';
import { PermissionsScreen } from '../features/admin/permissions/permissions-screen';
import { SystemScreen } from '../features/admin/system/system-screen';
import { AuditScreen } from '../features/admin/audit/audit-screen';
import { FeatureFlagsScreen } from '../features/admin/feature-flags/feature-flags-screen';
import { MaintenanceScreen } from '../features/admin/maintenance/maintenance-screen';

describe('Platform Administration Console Integration tests', () => {
  test('Verify all admin feature modules and layout definitions compile', () => {
    expect(adminNavigation.length).toBeGreaterThan(5);
    expect(AdminDashboardScreen).toBeDefined();
    expect(OrganizationsScreen).toBeDefined();
    expect(UsersScreen).toBeDefined();
    expect(PermissionsScreen).toBeDefined();
    expect(SystemScreen).toBeDefined();
    expect(AuditScreen).toBeDefined();
    expect(FeatureFlagsScreen).toBeDefined();
    expect(MaintenanceScreen).toBeDefined();
  });
});
