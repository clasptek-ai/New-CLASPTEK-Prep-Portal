import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { getAuthContext } from './auth-context';

export interface AuthenticatedSession {
  userId: string;
  profileId: string;
  roles: string[];
  tenantId?: string;
}

export async function getAuthenticatedSession(
  req: NextRequest
): Promise<AuthenticatedSession | null> {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      'https://mock.supabase.co';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key';

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

    return {
      userId: user.id,
      profileId: 'profile-' + user.id,
      roles: roleNames,
    };
  } catch (err: any) {
    console.error('getAuthenticatedSession error:', err);
    return null;
  }
}
