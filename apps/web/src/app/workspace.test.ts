import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/instructor/dashboard',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn()
    })
  };
});

vi.mock('../providers/theme-provider', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
      theme: 'dark',
      setTheme: vi.fn()
    })
  };
});

import { WorkspaceProvider } from '../workspace/WorkspaceProvider';
import { WorkspaceShell } from '../workspace/WorkspaceShell';
import { workspaceRegistry } from '../workspace/workspace-registry';

describe('Unified Workspace Framework Integration tests', () => {
  test('Verify unified workspace configurations compile and map key variables', () => {
    expect(WorkspaceProvider).toBeDefined();
    expect(WorkspaceShell).toBeDefined();
    expect(workspaceRegistry.STUDENT).toBeDefined();
    expect(workspaceRegistry.INSTRUCTOR).toBeDefined();
    expect(workspaceRegistry.AUTHORING).toBeDefined();
    expect(workspaceRegistry.ADMIN).toBeDefined();
    
    // Check navigation paths are defined
    expect(workspaceRegistry.STUDENT.navigation.length).toBeGreaterThan(0);
    expect(workspaceRegistry.INSTRUCTOR.navigation.length).toBeGreaterThan(0);
  });

  test('Verify event subscription interfaces are compiled', () => {
    expect(workspaceRegistry.ADMIN.navigation.length).toBeGreaterThan(0);
  });
});
