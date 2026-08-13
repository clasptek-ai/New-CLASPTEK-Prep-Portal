export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment, getAppUrl } from '@clasptek/configuration';
import { createSupabaseServerClient, DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function POST(req: NextRequest) {
  const { logger } = await getAuthContext();
  let createdAuthUserId: string | null = null;

  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, programme, provider } = body;

    if (!email || !password) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const config = loadEnvironment(process.env);
    const cookieStore = await cookies();

    const dbLogger = new ConsoleLogger('RegisterRoute');
    const dbPool = new DatabasePool(config, dbLogger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Check if an active account already exists in identities & auth
    const existingIdentRes = await pool.query(
      `SELECT user_id FROM public.identities WHERE LOWER(email) = $1 LIMIT 1`,
      [normalizedEmail]
    );

    if (existingIdentRes.rows.length > 0) {
      const existingUserId = existingIdentRes.rows[0].user_id;
      const supabaseAdmin = getSupabaseServerClient();
      const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserById(existingUserId);

      if (existingAuthUser?.user) {
        return NextResponse.json(
          {
            code: 'ACCOUNT_EXISTS',
            message: 'An account with this email address already exists. Please sign in.',
          },
          { status: 409 }
        );
      } else {
        // Orphaned identity record from deleted user -> purge orphaned record before new signUp
        logger.info(
          `[REGISTER_PRE_CHECK] Purging orphaned identity/user rows for email: ${normalizedEmail}`
        );
        await pool.query('DELETE FROM public.security_profiles WHERE user_id = $1', [
          existingUserId,
        ]);
        await pool.query('DELETE FROM public.user_roles WHERE user_id = $1', [existingUserId]);
        await pool.query('DELETE FROM public.identities WHERE email = $1', [normalizedEmail]);
        await pool.query('DELETE FROM public.profiles WHERE user_id = $1', [existingUserId]);
        await pool.query('DELETE FROM public.users WHERE id = $1', [existingUserId]);
      }
    }

    // 2. Primary Public Registration via Supabase Auth signUp
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

    const appUrl = getAppUrl(process.env);
    const emailRedirectTo = `${appUrl}/auth/callback?next=/student/welcome`;

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          programme: programme || null,
        },
      },
    });

    if (signUpErr || !signUpData?.user?.id) {
      const isAlreadyRegistered =
        signUpErr?.message?.toLowerCase().includes('already registered') ||
        signUpErr?.message?.toLowerCase().includes('user already exists');
      if (isAlreadyRegistered) {
        return NextResponse.json(
          {
            code: 'ACCOUNT_EXISTS',
            message: 'An account with this email address already exists. Please sign in.',
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { code: 'AUTH_ERROR', message: signUpErr?.message || 'Failed to create auth user' },
        { status: 400 }
      );
    }

    const userId = signUpData.user.id;
    createdAuthUserId = userId;
    const userEmail = signUpData.user.email || normalizedEmail;

    // 3. Execute strict atomic database transaction for domain entities
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Step 3a: Insert public.users (referenced by fk_users_id -> auth.users)
      await client.query(
        `INSERT INTO public.users (id, status, version, created_at, updated_at)
         VALUES ($1, 'ACTIVE', 1, now(), now())
         ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
        [userId]
      );

      // Step 3b: Insert public.profiles
      await client.query(
        `INSERT INTO public.profiles (id, user_id, first_name, last_name, phone, target_programme, locale, time_zone, version, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'en', 'UTC', 1, now(), now())
         ON CONFLICT (user_id) DO UPDATE SET
           first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
           last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
           phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
           target_programme = COALESCE(EXCLUDED.target_programme, public.profiles.target_programme),
           updated_at = now()`,
        [userId, firstName || 'Student', lastName || 'Candidate', phone || null, programme || null]
      );

      // Step 3c: Insert public.identities
      await client.query(
        `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, $2, 1, now(), now())
         ON CONFLICT (email) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           login_identifier = EXCLUDED.login_identifier,
           updated_at = now()`,
        [userId, userEmail, (provider || 'LOCAL').toUpperCase()]
      );

      // Step 3d: Insert public.security_profiles
      await client.query(
        `INSERT INTO public.security_profiles (id, user_id, lock_status, failed_attempts, version, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'UNLOCKED', 0, 1, now(), now())
         ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
        [userId]
      );

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (err: unknown) {
    logger.error(
      'POST /api/v1/auth/register failure',
      err instanceof Error ? err : new Error(String(err))
    );

    // Rollback newly created Supabase Auth user if application records failed to write
    if (createdAuthUserId) {
      try {
        const supabaseAdmin = getSupabaseServerClient();
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
        logger.info(`[REGISTER_ROLLBACK] Cleaned up newly created auth user: ${createdAuthUserId}`);
      } catch (rollbackErr) {
        logger.warn(`[REGISTER_ROLLBACK_WARN] Failed to rollback auth user ${createdAuthUserId}:`, {
          error: String(rollbackErr),
        });
      }
    }

    if (err instanceof ApplicationError) {
      return NextResponse.json(err.serialize(), { status: 400 });
    }
    return NextResponse.json(
      {
        code: 'REGISTRATION_FAILED',
        message: 'Account registration could not be completed. Please try again.',
      },
      { status: 500 }
    );
  }
}
