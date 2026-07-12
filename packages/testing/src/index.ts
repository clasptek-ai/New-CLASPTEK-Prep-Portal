/**
 * @service Testing
 * Shared test fixtures and builder helpers
 */

export interface MockPrincipal {
  userId: string;
  roles: string[];
  permissions: string[];
}

export function createMockPrincipal(overrides?: Partial<MockPrincipal>): MockPrincipal {
  return {
    userId: '00000000-0000-0000-0000-000000000000',
    roles: ['student'],
    permissions: ['identity:profile:read'],
    ...overrides,
  };
}
