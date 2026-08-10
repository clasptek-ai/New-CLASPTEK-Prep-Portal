export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment, getAppUrl } from '@clasptek/configuration';
import { createSupabaseServerClient, DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';

export async function POST(req: NextRequest) {
  const { logger } = await getAuthContext();
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, programme, provider } = body;

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

    const appUrl = getAppUrl(process.env);
    const emailRedirectTo = `${appUrl}/auth/callback?next=/student/welcome`;

    // 1. Primary Public Registration via Supabase Auth signUp
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
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
      // If auth user creation fails or produces no valid user.id, return error immediately.
      // Do NOT start the SQL transaction, preserving database integrity.
      return NextResponse.json(
        { code: 'AUTH_ERROR', message: signUpErr?.message || 'Failed to create auth user' },
        { status: 400 }
      );
    }

    const userId = signUpData.user.id;
    const userEmail = signUpData.user.email || email;

    // 2. Execute strict atomic database transaction for domain entities
    const dbLogger = new ConsoleLogger('RegisterRoute');
    const dbPool = new DatabasePool(config, dbLogger);
    await dbPool.connect();
    const pool = dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Step 2a: Insert public.users (referenced by fk_users_id -> auth.users)
      await client.query(
        `INSERT INTO public.users (id, status, version, created_at, updated_at)
         VALUES ($1, 'ACTIVE', 1, now(), now())
         ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
        [userId]
      );

      // Step 2b: Insert public.profiles
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

      // Step 2c: Insert public.identities (using ON CONFLICT (email) matching uq_identities_email constraint)
      await client.query(
        `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, $2, 1, now(), now())
         ON CONFLICT (email) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           login_identifier = EXCLUDED.login_identifier,
           updated_at = now()`,
        [userId, userEmail, (provider || 'LOCAL').toUpperCase()]
      );

      // Step 2d: Insert public.security_profiles (using lock_status column name)
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
    if (err instanceof ApplicationError) {
      return NextResponse.json(err.serialize(), { status: 400 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
