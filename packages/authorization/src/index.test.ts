import { describe, test, expect } from 'vitest';
import { hasPermission, PrincipalContext } from './index';

describe('Authorization Policy Unit Tests', () => {
  test('User has required permission', () => {
    const principal: PrincipalContext = {
      userId: '123',
      permissions: ['identity:profile:read'],
    };
    expect(hasPermission(principal, 'identity:profile:read')).toBe(true);
  });

  test('User lacks permission', () => {
    const principal: PrincipalContext = {
      userId: '123',
      permissions: ['identity:profile:read'],
    };
    expect(hasPermission(principal, 'identity:profile:write')).toBe(false);
  });
});
