export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { loadEnvironment, getAppUrl } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const isAdmin =
      session &&
      session.roles.some((r) =>
        ['ADMINISTRATOR', 'SUPER_ADMIN', 'SUPER_ADMINISTRATOR', 'STAFF'].includes(r)
      );

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('ResendVerificationRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Resolve user email from auth.users
    const userRes = await pool.query(
      'SELECT id, email, email_confirmed_at FROM auth.users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User record not found.' },
        { status: 404 }
      );
    }

    const targetUser = userRes.rows[0];

    if (targetUser.email_confirmed_at) {
      return NextResponse.json(
        { success: false, message: 'Account email has already been verified.' },
        { status: 400 }
      );
    }

    // 2. Resend verification email via Supabase Auth Admin
    const supabaseAdmin = getSupabaseServerClient();
    const appUrl = getAppUrl(process.env);
    const redirectTo = `${appUrl}/auth/callback?next=/student/welcome`;

    const { error: resendErr } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: targetUser.email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (resendErr) {
      return NextResponse.json(
        { success: false, message: resendErr.message || 'Failed to resend confirmation email.' },
        { status: 500 }
      );
    }

    // 3. Record Audit Log
    await pool
      .query(
        `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
       VALUES (gen_random_uuid(), $1, 'ADMIN_RESENT_VERIFICATION_EMAIL', 'auth.users', $2, $3, NOW())`,
        [session.userId, userId, JSON.stringify({ email: targetUser.email, redirectTo })]
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      message: `Account confirmation email resent to ${targetUser.email} successfully.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
