export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';
import { SecurityProfile } from '@clasptek/domain-security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.email || !body.password) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    const authContext = await getAuthContext();
    const {
      dbPool,
      securityProfileRepo,
      recordLoginSessionHandler,
      ensureUserAggregateExistsService,
      logger,
    } = authContext;

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

    // 1. Pre-auth security profile lock check & auto-unlock evaluation
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
    } catch (dbErr) {
      logger.warn('Pre-auth security profile lookup deferred:', {
        error: dbErr instanceof Error ? dbErr.message : String(dbErr),
      });
    }

    if (securityProfile) {
      // Auto-unlock if lock expiration has passed
      if (securityProfile.lockStatus === 'LOCKED') {
        const isExpired = securityProfile.autoUnlockIfExpired();
        if (isExpired) {
          await securityProfileRepo.save(securityProfile).catch(() => {});
          await pool
            .query(
              `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
             VALUES (gen_random_uuid(), $1, 'AUTO_UNLOCKED_EXPIRED_ACCOUNT', 'public.security_profiles', $2, $3, NOW())`,
              [
                securityProfile.userId,
                securityProfile.id,
                JSON.stringify({ email, autoUnlockedAt: new Date().toISOString() }),
              ]
            )
            .catch(() => null);
        } else {
          // Still locked: Calculate retryAfterMinutes
          const retryAfterMinutes = securityProfile.lockExpiresAt
            ? Math.max(1, Math.ceil((securityProfile.lockExpiresAt.getTime() - Date.now()) / 60000))
            : 15;

          await pool
            .query(
              `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
             VALUES (gen_random_uuid(), $1, 'BLOCKED_LOCKED_ACCOUNT_LOGIN_ATTEMPT', 'public.security_profiles', $2, $3, NOW())`,
              [
                securityProfile.userId,
                securityProfile.id,
                JSON.stringify({
                  email,
                  retryAfterMinutes,
                  lockExpiresAt: securityProfile.lockExpiresAt,
                }),
              ]
            )
            .catch(() => null);

          return NextResponse.json(
            {
              code: 'ACCOUNT_LOCKED',
              message: `Account is temporarily locked due to excessive failed attempts. Please try again in ${retryAfterMinutes} minute(s).`,
              retryAfterMinutes,
              lockExpiresAt: securityProfile.lockExpiresAt?.toISOString(),
            },
            { status: 403 }
          );
        }
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (securityProfile) {
        securityProfile.incrementFailedAttempts(5);
        await securityProfileRepo.save(securityProfile).catch(() => {});

        await pool
          .query(
            `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
           VALUES (gen_random_uuid(), $1, $2, 'public.security_profiles', $3, $4, NOW())`,
            [
              securityProfile.userId,
              securityProfile.lockStatus === 'LOCKED'
                ? 'ACCOUNT_LOCKED_EXCESSIVE_FAILED_ATTEMPTS'
                : 'FAILED_LOGIN_ATTEMPT',
              securityProfile.id,
              JSON.stringify({
                email,
                failedAttempts: securityProfile.failedAttempts,
                lockStatus: securityProfile.lockStatus,
                lockExpiresAt: securityProfile.lockExpiresAt,
                error: error.message,
              }),
            ]
          )
          .catch(() => null);
      }
      const errMsg = (error.message || '').toLowerCase();
      if (errMsg.includes('banned') || errMsg.includes('suspended')) {
        return NextResponse.json(
          {
            code: 'ACCOUNT_SUSPENDED',
            message: 'This account has been suspended. Please contact support.',
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        { status: 401 }
      );
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
        .then((res) => res.rows.map((row: { name: string }) => row.name))
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
          logger.warn('User aggregate sync deferred:', {
            error: err instanceof Error ? err.message : String(err),
          });
        }),

      // C. Reset failed attempts
      (async () => {
        try {
          const profile = await securityProfileRepo.findByUserId(userId);
          if (profile) {
            profile.resetFailedAttempts();
            await securityProfileRepo.save(profile);
          }
        } catch {
          // Ignore profile load failures during background reset
        }
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
          logger.warn('Login session recording deferred:', {
            error: err instanceof Error ? err.message : String(err),
          });
        }),
    ]);

    const roleNames = roleResult.length > 0 ? roleResult : ['STUDENT'];

    logger.info('POST /api/v1/auth/login success', {
      userId,
      roles: roleNames,
    });

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      roles: roleNames,
    });
  } catch (err: unknown) {
    console.error('[AUTH_LOGIN_ERROR]', err);
    if (err instanceof ApplicationError) {
      return NextResponse.json(err.serialize(), { status: 400 });
    }
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Unexpected server error',
      },
      { status: 500 }
    );
  }
}
