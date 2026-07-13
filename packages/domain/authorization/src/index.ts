import { AggregateRoot } from '@clasptek/kernel';

export type PermissionCode =
  | 'identity:profile:read'
  | 'identity:profile:write'
  | 'identity:profile:archive'
  | 'identity:profile:restore'
  | 'auth:session:read'
  | 'auth:session:write'
  | 'security:lock:write'
  | 'security:lock:read';

export interface PrincipalContext {
  userId: string;
  academyId?: string;
  permissions: PermissionCode[];
}

export function hasPermission(principal: PrincipalContext, required: PermissionCode): boolean {
  return principal.permissions.includes(required);
}

export class Role extends AggregateRoot<string> {
  constructor(
    id: string,
    public readonly name: string,
    public readonly description: string = '',
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    super(id);
  }
}

export class Permission {
  constructor(
    public readonly id: string,
    public readonly permissionGroupId: string,
    public readonly code: PermissionCode,
    public readonly description: string = '',
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}

export class PermissionGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string = '',
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}

export class UserRole {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roleId: string,
    public readonly version: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}

export interface RoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  save(role: Role): Promise<void>;
}

export interface PermissionGroupRepository {
  findById(id: string): Promise<PermissionGroup | null>;
  findByName(name: string): Promise<PermissionGroup | null>;
  save(group: PermissionGroup): Promise<void>;
  savePermission(permission: Permission): Promise<void>;
  assignGroupToRole(roleId: string, groupId: string): Promise<void>;
}

export interface UserRoleRepository {
  findByUserId(userId: string): Promise<UserRole[]>;
  save(userRole: UserRole): Promise<void>;
  delete(userId: string, roleId: string): Promise<void>;
}
