import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { loadEnvironment, getAppUrl } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, errorResponse } = await requireAdminSession(req);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminPasswordResetRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Resolve user email from auth.users or public.users
    const userRes = await pool.query(
      `SELECT au.id, au.email
       FROM auth.users au
       WHERE au.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Candidate user record not found.' },
        { status: 404 }
      );
    }

    const targetEmail = userRes.rows[0].email;
    const appUrl = getAppUrl(process.env);
    const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

    // 2. Dispatch password reset link via Supabase Auth Admin / Server Client
    const supabaseAdmin = getSupabaseServerClient();
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(targetEmail, {
      redirectTo,
    });

    if (resetError) {
      const errObj = new Error(resetError.message || 'Auth reset error');
      logger.error('[ADMIN_PASSWORD_RESET_ERROR]', errObj, { userId, targetEmail });
      return NextResponse.json(
        { success: false, message: resetError.message || 'Failed to dispatch reset email.' },
        { status: 500 }
      );
    }

    // 3. Log audit event
    try {
      await pool.query(
        `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
         VALUES (gen_random_uuid(), $1, 'ADMIN_INITIATED_PASSWORD_RESET', 'auth.users', $2, $3, NOW())`,
        [session.userId, userId, JSON.stringify({ email: targetEmail, redirectTo })]
      );
    } catch (auditErr: unknown) {
      const errObj = auditErr instanceof Error ? auditErr : new Error(String(auditErr));
      logger.warn('[AUDIT_LOG_WARNING]', { error: errObj.message });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Password reset link dispatched successfully to ${targetEmail}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('[ADMIN_RESET_PASSWORD_HANDLER_ERROR]', err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
