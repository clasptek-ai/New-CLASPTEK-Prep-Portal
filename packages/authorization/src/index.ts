/**
 * @domain Authorization
 * @service PolicyEngine
 * Permissions registries and validation contexts
 */

export type PermissionCode =
  | 'identity:profile:read'
  | 'identity:profile:write'
  | 'identity:session:read'
  | 'identity:session:revoke'
  | 'audit:event:read'
  | 'platform:settings:write'
  | 'platform:flags:write';

export interface PrincipalContext {
  userId: string;
  academyId?: string;
  permissions: PermissionCode[];
}

export function hasPermission(principal: PrincipalContext, required: PermissionCode): boolean {
  return principal.permissions.includes(required);
}

export function hasAnyPermission(principal: PrincipalContext, required: PermissionCode[]): boolean {
  return required.some((perm) => principal.permissions.includes(perm));
}
