export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';

export interface SessionUserDTO {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export interface SessionProfileDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface SessionResponseDTO {
  success: boolean;
  user: SessionUserDTO;
  profile: SessionProfileDTO;
  roles: string[];
  permissions: string[];
  workspaces: string[];
  defaultWorkspace: string;
  expiresAt: string;
  sessionId: string;
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  STUDENT: [
    'learning.read',
    'practice.take',
    'assessments.take',
    'mock.take',
    'results.view',
    'profile.edit',
  ],
  INSTRUCTOR: [
    'learning.read',
    'curriculum.read',
    'curriculum.write',
    'assessments.review',
    'mock.grade',
    'students.view',
    'analytics.view',
  ],
  PROGRAMME_MANAGER: [
    'learning.read',
    'programme.read',
    'programme.write',
    'curriculum.manage',
    'questionbank.manage',
    'assessments.manage',
    'reports.view',
  ],
  ADMINISTRATOR: [
    'learning.read',
    'programme.manage',
    'curriculum.manage',
    'questionbank.manage',
    'assessments.manage',
    'students.manage',
    'instructors.manage',
    'admissions.manage',
    'announcements.publish',
    'reports.manage',
    'settings.manage',
    'audit.view',
  ],
  SUPER_ADMINISTRATOR: [
    '*:*',
  ],
};

function resolveWorkspaces(roles: string[]): { workspaces: string[]; defaultWorkspace: string } {
  const isAdmin = roles.some((r) =>
    ['ADMINISTRATOR', 'SUPER_ADMIN', 'SUPER_ADMINISTRATOR', 'STAFF'].includes(r)
  );
  const isInstructor = roles.some((r) => ['INSTRUCTOR', 'TUTOR'].includes(r));

  if (isAdmin) {
    return {
      workspaces: ['student', 'instructor', 'admin'],
      defaultWorkspace: 'admin',
    };
  }

  if (isInstructor) {
    return {
      workspaces: ['student', 'instructor'],
      defaultWorkspace: 'instructor',
    };
  }

  return {
    workspaces: ['student'],
    defaultWorkspace: 'student',
  };
}

function resolvePermissions(roles: string[]): string[] {
  const permSet = new Set<string>();
  roles.forEach((role) => {
    const perms = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS['STUDENT'];
    perms.forEach((p) => permSet.add(p));
  });
  return Array.from(permSet);
}

export async function GET(_req: NextRequest) {
  try {
    // 1. Load environment & cookies
    const config = loadEnvironment(process.env);
    const cookieStore = await cookies();

    // 2. Initialize Supabase Server Client
    const supabase = createSupabaseServerClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
            // Handled if cookies are immutable in RSC
          }
        },
      }
    );

    // 3. Supabase Token & User Session Validation
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          code: 'UNAUTHORIZED',
          message: 'User session is not authenticated or has expired.',
        },
        { status: 401 }
      );
    }

    // 4. Initialize Auth Context for DB queries
    let roleNames: string[] = [];
    try {
      const authContext = await getAuthContext();
      const { userRoleRepo, roleRepo, dbPool } = authContext;

      const pool = dbPool.getPool();
      const roleResult = await pool.query(
        'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
        [user.id]
      );
      roleNames = roleResult.rows.map((row: any) => row.name);
    } catch {
      // Fallback heuristics if DB pool query fails
      if (user.email?.toLowerCase().includes('admin') || user.email?.toLowerCase() === 'clasptek@gmail.com') {
        roleNames = ['ADMINISTRATOR'];
      } else if (user.email?.toLowerCase().includes('instructor')) {
        roleNames = ['INSTRUCTOR'];
      } else {
        roleNames = ['STUDENT'];
      }
    }

    if (user.email?.toLowerCase() === 'clasptek@gmail.com') {
      roleNames = ['ADMINISTRATOR'];
    }

    const resolvedRoles = roleNames.length > 0 ? roleNames : ['STUDENT'];
    const resolvedPermissions = resolvePermissions(resolvedRoles);
    const { workspaces, defaultWorkspace } = resolveWorkspaces(resolvedRoles);

    // 5. Construct Profile DTO
    let profileName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Authenticated Student';

    if (user.email?.toLowerCase() === 'clasptek@gmail.com') {
      profileName = 'Clasptek Coaching Limited';
    }

    const profile: SessionProfileDTO = {
      id: user.id,
      name: profileName,
      email: user.email || '',
      avatarUrl: user.user_metadata?.avatar_url,
    };

    // 6. Return Unified Session Response DTO
    const responseDTO: SessionResponseDTO = {
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata,
      },
      profile,
      roles: resolvedRoles,
      permissions: resolvedPermissions,
      workspaces,
      defaultWorkspace,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      sessionId: `sess_${user.id.substring(0, 8)}`,
    };

    return NextResponse.json(responseDTO);
  } catch (err: unknown) {
    // Log error internally, sanitize client response (0 stack traces exposed)
    console.error('GET /api/v1/auth/session failure:', err);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'An internal authentication error occurred.',
      },
      { status: 500 }
    );
  }
}
