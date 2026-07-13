import {
  RoleRepository,
  PermissionGroupRepository,
  UserRole,
  UserRoleRepository,
} from '@clasptek/domain-authorization';
import { NotFoundError } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// 1. Commands

export interface AssignUserRoleCommand {
  userId: string;
  roleName: string;
}

export interface GrantCapabilityCommand {
  roleName: string;
  permissionGroupName: string;
}

// 2. Handlers

export class AssignUserRoleHandler {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly userRoleRepo: UserRoleRepository
  ) {}

  public async execute(command: AssignUserRoleCommand): Promise<string> {
    const role = await this.roleRepo.findByName(command.roleName);
    if (!role) {
      throw new NotFoundError(`Role "${command.roleName}" not found in system`);
    }

    const newAssignment = new UserRole(randomUUID(), command.userId, role.id);

    await this.userRoleRepo.save(newAssignment);
    return newAssignment.id;
  }
}

export class GrantCapabilityHandler {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly groupRepo: PermissionGroupRepository
  ) {}

  public async execute(command: GrantCapabilityCommand): Promise<void> {
    const role = await this.roleRepo.findByName(command.roleName);
    if (!role) {
      throw new NotFoundError(`Role "${command.roleName}" not found`);
    }

    const group = await this.groupRepo.findByName(command.permissionGroupName);
    if (!group) {
      throw new NotFoundError(`Permission group "${command.permissionGroupName}" not found`);
    }

    await this.groupRepo.assignGroupToRole(role.id, group.id);
  }
}
