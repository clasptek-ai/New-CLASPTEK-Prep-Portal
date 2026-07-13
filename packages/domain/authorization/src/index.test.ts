import { describe, test, expect } from 'vitest';
import {
  Role,
  Permission,
  PermissionGroup,
  UserRole,
  PrincipalContext,
  hasPermission,
} from './index';

describe('Authorization Domain Unit Tests', () => {
  const principal: PrincipalContext = {
    userId: 'user-1',
    permissions: ['identity:profile:read', 'identity:profile:write'],
  };

  test('hasPermission validates permissions correctly', () => {
    expect(hasPermission(principal, 'identity:profile:read')).toBe(true);
    expect(hasPermission(principal, 'security:lock:read')).toBe(false);
  });

  test('Role, Permission, and PermissionGroup instantiate correctly', () => {
    const role = new Role('role-1', 'Student', 'Student access');
    const group = new PermissionGroup('group-1', 'Identity Management');
    const perm = new Permission('perm-1', 'group-1', 'identity:profile:read');
    const userRole = new UserRole('assignment-1', 'user-1', 'role-1');

    expect(role.name).toBe('Student');
    expect(group.name).toBe('Identity Management');
    expect(perm.code).toBe('identity:profile:read');
    expect(userRole.roleId).toBe('role-1');
  });
});
