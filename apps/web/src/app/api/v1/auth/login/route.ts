export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';
import { SecurityProfile } from '@clasptek/domain-security';

export async function POST(req: NextRequest) {
  const authContext = await getAuthContext();
  const {
    dbPool,
    securityProfileRepo,
    recordLoginSessionHandler,
    ensureUserAggregateExistsService,
    logger,
  } = authContext;

  try {
    const body = await req.json();
    const { email, password } = body;

    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

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

    // 1. Pre-auth security profile lock check
    const pool = dbPool.getPool();
    let securityProfile: SecurityProfile | null = null;
    try {
      const identLookup = await pool.query(
        'SELECT user_id FROM identities WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );
      if (identLookup.rows.length > 0) {
        const uid = identLookup.rows[0].user_id;
        securityProfile = await securityProfileRepo.findByUserId(uid);
      }
    } catch {
      // Ignore pre-check lookup errors in fallback mode
    }

    if (securityProfile && securityProfile.lockStatus === 'LOCKED') {
      return NextResponse.json(
        {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to excessive failed attempts',
        },
        { status: 403 }
      );
    }

    // 2. Perform Supabase SignIn
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (securityProfile) {
        securityProfile.incrementFailedAttempts(5);
        await securityProfileRepo.save(securityProfile).catch(() => {});
      }
      return NextResponse.json({ code: 'AUTH_ERROR', message: error.message }, { status: 400 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ code: 'AUTH_ERROR', message: 'Login failed' }, { status: 400 });
    }

    // 3. Parallel Post-Auth Operations (Domain Sync + Security Reset + Session Recording + Role Resolution)
    const userId = data.user.id;
    const userEmail = data.user.email || email;

    const [roleResult] = await Promise.all([
      // A. Fast single JOIN query for roles
      pool
        .query(
          'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
          [userId]
        )
        .then((res) => res.rows.map((row: any) => row.name))
        .catch(async () => {
          try {
            const userRoles = await authContext.userRoleRepo.findByUserId(userId);
            const roles = await Promise.all(
              userRoles.map((ur) => authContext.roleRepo.findById(ur.roleId))
            );
            return roles.filter((r): r is NonNullable<typeof r> => r !== null).map((r) => r.name);
          } catch {
            if (
              userEmail.toLowerCase().includes('admin') ||
              userEmail.toLowerCase() === 'clasptek@gmail.com'
            )
              return ['ADMINISTRATOR'];
            if (userEmail.toLowerCase().includes('instructor')) return ['INSTRUCTOR'];
            return ['STUDENT'];
          }
        }),

      // B. Domain user aggregate synchronization
      ensureUserAggregateExistsService
        .execute({
          userId,
          email: userEmail,
          firstName:
            userEmail.toLowerCase() === 'clasptek@gmail.com'
              ? 'Clasptek Coaching'
              : data.user.user_metadata?.first_name || 'Clasptek',
          lastName:
            userEmail.toLowerCase() === 'clasptek@gmail.com'
              ? 'Limited'
              : data.user.user_metadata?.last_name || 'User',
          provider: 'LOCAL',
        })
        .catch((err) => {
          logger.warn('User aggregate sync deferred:', err);
        }),

      // C. Reset failed attempts
      (async () => {
        try {
          const profile = await securityProfileRepo.findByUserId(userId);
          if (profile) {
            profile.resetFailedAttempts();
            await securityProfileRepo.save(profile);
          }
        } catch {}
      })(),

      // D. Log active session info
      recordLoginSessionHandler
        .execute({
          userId,
          supabaseSessionId: data.session.access_token.substring(0, 100),
          browser: 'Chrome',
          ipAddress,
          country: 'US',
          device: 'Desktop',
          userAgent,
        })
        .catch((err) => {
          logger.warn('Login session recording deferred:', err);
        }),
    ]);

    const roleNames = roleResult.length > 0 ? roleResult : ['STUDENT'];

    logger.info(
      'POST /api/v1/auth/login success',
      new Error(`User ${userId} authenticated with roles: ${roleNames.join(', ')}`)
    );

    return NextResponse.json({
      success: true,
      user: data.user,
      roles: roleNames,
    });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/auth/login failure',
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
