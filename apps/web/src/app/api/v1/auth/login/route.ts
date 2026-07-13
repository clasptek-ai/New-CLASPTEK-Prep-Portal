import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';
import { SecurityProfile } from '@clasptek/domain-security';

export async function POST(req: NextRequest) {
  const { securityProfileRepo, recordLoginSessionHandler, logger } = await getAuthContext();

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

    // 1. Resolve user ID associated with this email
    const dbPool = (await getAuthContext()).dbPool.getPool();
    const identLookup = await dbPool.query(
      'SELECT user_id FROM identities WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    let securityProfile: SecurityProfile | null = null;
    if (identLookup.rows.length > 0) {
      const uid = identLookup.rows[0].user_id;
      securityProfile = await securityProfileRepo.findByUserId(uid);
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
      // Increment failed attempts if security profile exists
      if (securityProfile) {
        securityProfile.incrementFailedAttempts(5);
        await securityProfileRepo.save(securityProfile);
      }
      return NextResponse.json({ code: 'AUTH_ERROR', message: error.message }, { status: 400 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ code: 'AUTH_ERROR', message: 'Login failed' }, { status: 400 });
    }

    // 3. Reset failed attempts count on successful login
    if (securityProfile) {
      securityProfile.resetFailedAttempts();
      await securityProfileRepo.save(securityProfile);
    }

    // 4. Log active session info
    await recordLoginSessionHandler.execute({
      userId: data.user.id,
      supabaseSessionId: data.session.access_token.substring(0, 100),
      browser: 'Chrome',
      ipAddress,
      country: 'US',
      device: 'Desktop',
      userAgent,
    });

    return NextResponse.json({ success: true, user: data.user });
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
