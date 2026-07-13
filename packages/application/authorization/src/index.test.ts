import { describe, test, expect, vi } from 'vitest';
import { AssignUserRoleHandler, GrantCapabilityHandler } from './index';
import {
  Role,
  RoleRepository,
  PermissionGroup,
  PermissionGroupRepository,
  UserRoleRepository,
} from '@clasptek/domain-authorization';

describe('Application Authorization Handlers Tests', () => {
  const userUUID = '00000000-0000-0000-0000-000000000001';

  const mockRoleRepo: RoleRepository = {
    findById: vi.fn(),
    findByName: vi.fn().mockImplementation(async (name: string) => {
      if (name === 'Admin') {
        return new Role('role-admin', 'Admin');
      }
      return null;
    }),
    save: vi.fn(),
  };

  const mockGroupRepo: PermissionGroupRepository = {
    findById: vi.fn(),
    findByName: vi.fn().mockImplementation(async (name: string) => {
      if (name === 'Assessment Management') {
        return new PermissionGroup('group-id', 'Assessment Management');
      }
      return null;
    }),
    save: vi.fn(),
    savePermission: vi.fn(),
    assignGroupToRole: vi.fn().mockResolvedValue(undefined),
  };

  const mockUserRoleRepo: UserRoleRepository = {
    findByUserId: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
  };

  test('AssignUserRoleHandler maps roles to users', async () => {
    const handler = new AssignUserRoleHandler(mockRoleRepo, mockUserRoleRepo);
    const id = await handler.execute({
      userId: userUUID,
      roleName: 'Admin',
    });

    expect(id).toBeDefined();
    expect(mockUserRoleRepo.save).toHaveBeenCalled();
  });

  test('GrantCapabilityHandler assigns group permissions to role', async () => {
    const handler = new GrantCapabilityHandler(mockRoleRepo, mockGroupRepo);
    await handler.execute({
      roleName: 'Admin',
      permissionGroupName: 'Assessment Management',
    });

    expect(mockGroupRepo.assignGroupToRole).toHaveBeenCalledWith('role-admin', 'group-id');
  });
});
