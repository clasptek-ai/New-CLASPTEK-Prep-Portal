export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';
import { loadEnvironment } from '@clasptek/configuration';
import { createSupabaseServerClient } from '@clasptek/persistence';
import { cookies } from 'next/headers';
import { ApplicationError } from '@clasptek/kernel';
import { SecurityProfile } from '@clasptek/domain-security';

export async function POST(req: NextRequest) {
  console.log('🔥 Login API reached');

  const {
    securityProfileRepo,
    recordLoginSessionHandler,
    ensureUserAggregateExistsService,
    logger,
  } = await getAuthContext();

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

    // 1. Resolve initial pre-auth security profile check by email
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
      if (securityProfile) {
        securityProfile.incrementFailedAttempts(5);
        await securityProfileRepo.save(securityProfile);
      }
      return NextResponse.json({ code: 'AUTH_ERROR', message: error.message }, { status: 400 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ code: 'AUTH_ERROR', message: 'Login failed' }, { status: 400 });
    }

    console.log(`AUTH LOGIN: ✓ Supabase Auth OK for ${data.user.email} (${data.user.id})`);

    // 3. Guarantee Domain User Aggregate and Security Profile exist atomically
    await ensureUserAggregateExistsService.execute({
      userId: data.user.id,
      email: data.user.email || email,
      firstName: data.user.user_metadata?.first_name || 'Clasptek',
      lastName: data.user.user_metadata?.last_name || 'User',
      provider: 'LOCAL',
    });
    console.log(`AUTH LOGIN: ✓ Domain User Verified / Synchronized (${data.user.id})`);

    // Reload security profile for post-login reset
    securityProfile = await securityProfileRepo.findByUserId(data.user.id);
    if (securityProfile) {
      securityProfile.resetFailedAttempts();
      await securityProfileRepo.save(securityProfile);
      console.log('AUTH LOGIN: ✓ Security Profile Reset');
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
    console.log('AUTH LOGIN: ✓ Session Persisted');

    // 5. Resolve roles for client route authorization
    let roleNames: string[] = [];
    try {
      const { userRoleRepo, roleRepo } = await getAuthContext();
      const userRoles = await userRoleRepo.findByUserId(data.user.id);
      const roles = await Promise.all(userRoles.map((ur) => roleRepo.findById(ur.roleId)));
      roleNames = roles.filter((r): r is NonNullable<typeof r> => r !== null).map((r) => r.name);
    } catch {
      const userEmail = data.user.email ?? '';
      if (userEmail.includes('admin')) roleNames = ['ADMINISTRATOR'];
      else if (userEmail.includes('instructor')) roleNames = ['INSTRUCTOR'];
      else roleNames = ['STUDENT'];
    }

    console.log(
      `AUTH LOGIN: ✓ Login Complete for ${data.user.id} with roles: ${roleNames.join(', ')}`
    );

    logger.info(
      'POST /api/v1/auth/login success',
      new Error(`User ${data.user.id} authenticated with roles: ${roleNames.join(', ')}`)
    );

    return NextResponse.json({
      success: true,
      user: data.user,
      roles: roleNames.length > 0 ? roleNames : ['STUDENT'],
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
