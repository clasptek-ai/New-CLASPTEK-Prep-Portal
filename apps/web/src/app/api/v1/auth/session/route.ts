export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';

export async function GET(_req: NextRequest) {
  const { logger } = await getAuthContext();
  try {
    const config = loadEnvironment(process.env);
    const cookieStore = await cookies();
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
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
        { status: 401 }
      );
    }

    // Resolve roles from database
    let roleNames: string[] = [];
    try {
      const userRoleRepo = (await getAuthContext()).userRoleRepo;
      const roleRepo = (await getAuthContext()).roleRepo;
      const userRoles = await userRoleRepo.findByUserId(user.id);
      const roles = await Promise.all(userRoles.map((ur) => roleRepo.findById(ur.roleId)));
      roleNames = roles.filter((r): r is any => r !== null).map((r) => r.name);
    } catch (dbErr) {
      logger.warn(
        'Could not query user roles from DB, utilizing heuristics',
        dbErr instanceof Error ? dbErr : new Error(String(dbErr))
      );
      if (user.email?.includes('admin')) {
        roleNames = ['ADMINISTRATOR'];
      } else if (user.email?.includes('instructor')) {
        roleNames = ['INSTRUCTOR'];
      } else {
        roleNames = ['STUDENT'];
      }
    }

    return NextResponse.json({
      success: true,
      user,
      roles: roleNames.length > 0 ? roleNames : ['STUDENT'],
    });
  } catch (err: unknown) {
    logger.error(
      'GET /api/v1/auth/session failure',
      err instanceof Error ? err : new Error(String(err))
    );
    if (err instanceof ApplicationError) {
      return NextResponse.json(err.serialize(), { status: 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
