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
    const config = loadEnvironment(process.env);
    const cookieStore = await cookies();

    // Create Supabase server client using the standard helper from persistence package
    const supabase = createSupabaseServerClient(
      config.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key',
      {
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
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // In development fallback mode, check headers for testing or mock access
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
