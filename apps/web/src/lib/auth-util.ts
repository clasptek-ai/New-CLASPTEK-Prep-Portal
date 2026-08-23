import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { getAuthContext } from './auth-context';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CANONICAL_SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export interface AuthenticatedSession {
  userId: string;
  profileId: string;
  roles: string[];
  tenantId?: string;
}

export function isValidTenantUuid(tenantId?: string | null): boolean {
  if (!tenantId || typeof tenantId !== 'string') return false;
  return UUID_REGEX.test(tenantId.trim());
}

export function resolveAuthorizedTenant(
  user: any,
  roleNames: string[],
  requestedHeaderTenant?: string | null
): string | undefined {
  const isStaffOrAdmin = roleNames.some((r) =>
    ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
  );
  const isSuperAdmin = roleNames.some((r) => ['ADMINISTRATOR', 'ADMIN'].includes(r.toUpperCase()));

  const appTenant = user?.app_metadata?.tenant_id || user?.app_metadata?.tenantId;
  const userMetaTenant = user?.user_metadata?.tenant_id || user?.user_metadata?.tenantId;
  const headerTenant = requestedHeaderTenant ? requestedHeaderTenant.trim() : null;

  // 1. If trusted app_metadata tenant_id exists and is valid
  if (isValidTenantUuid(appTenant)) {
    const validAppTenant = appTenant.trim();
    if (headerTenant && isValidTenantUuid(headerTenant)) {
      if (headerTenant.toLowerCase() === validAppTenant.toLowerCase()) {
        return validAppTenant;
      }
      // Only superadmin can switch to another validated tenant via header
      if (isSuperAdmin) {
        return headerTenant;
      }
      // Non-superadmin cannot supply arbitrary x-tenant-id; enforce appTenant
      return validAppTenant;
    }
    return validAppTenant;
  }

  // 2. If staff/admin with explicit valid header
  if (isStaffOrAdmin && headerTenant && isValidTenantUuid(headerTenant)) {
    return headerTenant;
  }

  // 3. If user_metadata contains valid tenant UUID
  if (isValidTenantUuid(userMetaTenant)) {
    return userMetaTenant.trim();
  }

  // 4. If staff/admin operating in system context
  if (isStaffOrAdmin) {
    return CANONICAL_SYSTEM_TENANT_ID;
  }

  // 5. Default fallback for standard registered user in system context
  return CANONICAL_SYSTEM_TENANT_ID;
}

export async function getAuthenticatedSession(
  req: NextRequest
): Promise<AuthenticatedSession | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        '[AUTH_UTIL] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.'
      );
      return null;
    }

    let cookieStore: any;
    try {
      cookieStore = await cookies();
    } catch {
      cookieStore = {
        getAll() {
          return [];
        },
        set() {},
      };
    }

    // 1. Extract Bearer token from headers if passed explicitly by client
    let bearerToken: string | null = null;
    const authHeader = req.headers.get('authorization') || req.headers.get('x-supabase-auth');
    if (authHeader?.startsWith('Bearer ')) {
      bearerToken = authHeader.substring(7).trim();
    } else if (authHeader) {
      bearerToken = authHeader.trim();
    }

    // 2. Create Supabase SSR server client using standard helper from persistence package
    const supabase = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            });
          });
        } catch {
          // Handled if cookies are immutable in Server Components
        }
      },
    });

    // 3. Authenticate candidate via Bearer JWT or Supabase SSR cookie session
    const {
      data: { user },
      error,
    } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 4. Resolve roles — priority order:
    //    a) Custom role DB table (most authoritative)
    //    b) Supabase app_metadata.role (set by admin via Supabase dashboard or server-side)
    //    c) Supabase user_metadata.role (set during registration)
    //    d) Default to STUDENT (never guess ADMINISTRATOR)
    let roleNames: string[] = [];

    try {
      const authCtx = await getAuthContext();
      const userRoles = await authCtx.userRoleRepo.findByUserId(user.id);
      const roles = await Promise.all(userRoles.map((ur) => authCtx.roleRepo.findById(ur.roleId)));
      roleNames = roles.filter((r): r is any => r !== null).map((r) => r.name);
    } catch {
      // DB lookup failed — fall back to JWT claims
      roleNames = [];
    }

    // If DB lookup returned nothing, check Supabase JWT metadata claims
    if (roleNames.length === 0) {
      // app_metadata is set server-side and is trusted
      const appRole = user.app_metadata?.role || user.app_metadata?.user_role;
      // user_metadata is set by the client during sign-up
      const userRole = user.user_metadata?.role || user.user_metadata?.user_role;

      const claimedRole = appRole || userRole;

      if (claimedRole) {
        // Normalize role name to uppercase
        roleNames = [String(claimedRole).toUpperCase()];
      } else {
        // No role found anywhere — default to STUDENT (never elevate privileges)
        roleNames = ['STUDENT'];
      }
    }

    // 5. Resolve authorized tenant
    const requestedTenantHeader = req.headers.get('x-tenant-id');
    const resolvedTenantId = resolveAuthorizedTenant(user, roleNames, requestedTenantHeader);

    return {
      userId: user.id,
      profileId: 'profile-' + user.id,
      roles: roleNames,
      tenantId: resolvedTenantId,
    };
  } catch (err: any) {
    console.error('getAuthenticatedSession error:', err);
    return null;
  }
}
