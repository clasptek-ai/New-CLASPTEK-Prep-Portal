import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { loadEnvironment } from '@clasptek/configuration';
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

    const cookieStore = await cookies();

    // Extract Bearer token from headers if passed by SPA / mobile client
    const authHeader = req.headers.get('authorization') || req.headers.get('x-supabase-auth');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7).trim()
      : authHeader?.trim();

    // Create Supabase server client using the standard helper from persistence package
    const supabase = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Handled if cookies are immutable
        }
      },
    });

    // Validate user token from Bearer header or cookie session
    const {
      data: { user },
      error,
    } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser();

    if (error || !user) {
      // Check for development / mock auth fallback headers
      const headerStudentId = req.headers.get('x-student-id');
      const headerRole = req.headers.get('x-user-role') || 'STUDENT';
      if (
        headerStudentId &&
        (process.env.NEXT_PUBLIC_DEV_MOCK_AUTH === 'true' ||
          process.env.NODE_ENV === 'test' ||
          process.env.NODE_ENV === 'development')
      ) {
        return {
          userId: headerStudentId,
          profileId: 'profile-' + headerStudentId,
          roles: [headerRole],
        };
      }
      return null;
    }

    // Resolve roles from DB
    let roleNames: string[] = [];
    try {
      const authCtx = await getAuthContext();
      const userRoles = await authCtx.userRoleRepo.findByUserId(user.id);
      const roles = await Promise.all(userRoles.map((ur) => authCtx.roleRepo.findById(ur.roleId)));
      roleNames = roles.filter((r): r is any => r !== null).map((r) => r.name);
    } catch {
      // Fallback role heuristics in case DB is offline/uninitialized in local dev
      if (user.email?.includes('admin')) {
        roleNames = ['ADMINISTRATOR'];
      } else if (user.email?.includes('instructor')) {
        roleNames = ['INSTRUCTOR'];
      } else {
        roleNames = ['STUDENT'];
      }
    }

    return {
      userId: user.id,
      profileId: 'profile-' + user.id,
      roles: roleNames.length > 0 ? roleNames : ['STUDENT'],
    };
  } catch {
    // In dev / test fall back to headers
    if (process.env.NEXT_PUBLIC_DEV_MOCK_AUTH === 'true' || process.env.NODE_ENV === 'test') {
      const headerStudentId = req.headers.get('x-student-id');
      const headerRole = req.headers.get('x-user-role') || 'STUDENT';
      if (headerStudentId) {
        return {
          userId: headerStudentId,
          profileId: 'profile-' + headerStudentId,
          roles: [headerRole],
        };
      }
    }
    return null;
  }
}
