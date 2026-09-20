import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RBACGuard } from '@/shared/auth/rbac-guard';

// Mock AuthContext
let mockAuthState = {
  roles: [] as string[],
  isLoading: false,
  isAuthenticated: false,
  user: null as any,
  session: null as any,
  refetchSession: vi.fn(),
};

vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: () => mockAuthState,
}));

let currentPath = '/admin/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Phase 5.3: Security Regression — Loading Boundary Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPath = '/admin/dashboard';
    mockAuthState = {
      roles: [],
      isLoading: false,
      isAuthenticated: false,
      user: null,
      session: null,
      refetchSession: vi.fn(),
    };
  });

  // TEST 1: While authorization is resolving, renders ONLY the branded loading screen and NEVER protected content
  it('1. Loading State: renders ClasptekLoadingScreen and suppresses protected children while resolving', () => {
    mockAuthState.isLoading = true;

    render(
      <RBACGuard>
        <div data-testid="protected-admin-content">SENSITIVE_ADMIN_METRICS</div>
      </RBACGuard>
    );

    // Protected children MUST NOT be rendered
    expect(screen.queryByTestId('protected-admin-content')).toBeNull();
    expect(screen.queryByText('SENSITIVE_ADMIN_METRICS')).toBeNull();

    // Canonical ClasptekLoadingScreen MUST be rendered with security context
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Verifying security authorization…')).toBeDefined();
  });

  // TEST 2: Student accessing admin route receives HTTP 403 Forbidden Access Screen (NEVER children)
  it('2. Student -> Admin route: renders ForbiddenAccessScreen (HTTP 403) and suppresses admin content', () => {
    mockAuthState.isLoading = false;
    mockAuthState.isAuthenticated = true;
    mockAuthState.roles = ['STUDENT'];
    currentPath = '/admin/dashboard';

    render(
      <RBACGuard>
        <div data-testid="protected-admin-content">SENSITIVE_ADMIN_METRICS</div>
      </RBACGuard>
    );

    expect(screen.queryByTestId('protected-admin-content')).toBeNull();
    expect(screen.getByText('HTTP 403 FORBIDDEN')).toBeDefined();
    expect(
      screen.getByText(
        'Students do not have permission to access the Enterprise Administration Workspace.'
      )
    ).toBeDefined();
  });

  // TEST 3: Student accessing /admin/attempt-review receives HTTP 403 Forbidden Screen
  it('3. Student -> /admin/attempt-review: strictly blocked with HTTP 403 Forbidden', () => {
    mockAuthState.isLoading = false;
    mockAuthState.isAuthenticated = true;
    mockAuthState.roles = ['STUDENT'];
    currentPath = '/admin/attempt-review';

    render(
      <RBACGuard>
        <div data-testid="protected-attempt-review">CONFIDENTIAL_ATTEMPT_DATA</div>
      </RBACGuard>
    );

    expect(screen.queryByTestId('protected-attempt-review')).toBeNull();
    expect(screen.getByText('HTTP 403 FORBIDDEN')).toBeDefined();
  });

  // TEST 4: Unauthorized role accessing restricted path receives HTTP 403
  it('4. Instructor -> Restricted Admin Settings: strictly blocked with HTTP 403 Forbidden', () => {
    mockAuthState.isLoading = false;
    mockAuthState.isAuthenticated = true;
    mockAuthState.roles = ['INSTRUCTOR'];
    currentPath = '/admin/settings';

    render(
      <RBACGuard>
        <div data-testid="system-settings-content">SYSTEM_SECURITY_CONFIG</div>
      </RBACGuard>
    );

    expect(screen.queryByTestId('system-settings-content')).toBeNull();
    expect(screen.getByText('HTTP 403 FORBIDDEN')).toBeDefined();
    expect(
      screen.getByText(/Instructor accounts are restricted from accessing System Settings/i)
    ).toBeDefined();
  });

  // TEST 5: Custom allowedRoles mismatch receives HTTP 403
  it('5. Role mismatch with custom allowedRoles: strictly blocked with HTTP 403 Forbidden', () => {
    mockAuthState.isLoading = false;
    mockAuthState.isAuthenticated = true;
    mockAuthState.roles = ['INSTRUCTOR'];
    currentPath = '/admin/custom';

    render(
      <RBACGuard allowedRoles={['SUPER_ADMIN']}>
        <div data-testid="super-admin-content">SUPER_ADMIN_KEYS</div>
      </RBACGuard>
    );

    expect(screen.queryByTestId('super-admin-content')).toBeNull();
    expect(screen.getByText('HTTP 403 FORBIDDEN')).toBeDefined();
    expect(screen.getByText(/Your active account role lacks required permissions/i)).toBeDefined();
  });

  // TEST 6: Valid Admin role renders protected children without loader
  it('6. Authorized Administrator: renders protected children immediately once resolved', () => {
    mockAuthState.isLoading = false;
    mockAuthState.isAuthenticated = true;
    mockAuthState.roles = ['ADMINISTRATOR'];
    currentPath = '/admin/dashboard';

    render(
      <RBACGuard>
        <div data-testid="protected-admin-content">SENSITIVE_ADMIN_METRICS</div>
      </RBACGuard>
    );

    // Protected content IS rendered
    expect(screen.getByTestId('protected-admin-content')).toBeDefined();
    expect(screen.getByText('SENSITIVE_ADMIN_METRICS')).toBeDefined();

    // Loader and error screens ARE NOT rendered
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByText('HTTP 403 FORBIDDEN')).toBeNull();
  });

  // TEST 7: Valid Student on student route renders student children without admin block
  it('7. Authorized Student on non-admin route: renders student content cleanly', () => {
    mockAuthState.isLoading = false;
    mockAuthState.isAuthenticated = true;
    mockAuthState.roles = ['STUDENT'];
    currentPath = '/dashboard';

    render(
      <RBACGuard>
        <div data-testid="student-workspace-content">STUDENT_PRACTICE_DASHBOARD</div>
      </RBACGuard>
    );

    expect(screen.getByTestId('student-workspace-content')).toBeDefined();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByText('HTTP 403 FORBIDDEN')).toBeNull();
  });
});
