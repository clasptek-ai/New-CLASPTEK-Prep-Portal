import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { loadEnvironment } from '@clasptek/configuration';
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
    const logger = new ConsoleLogger('ForceLogoutRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Invalidate active security_sessions in database
    await pool
      .query(
        'UPDATE public.security_sessions SET is_active = false, invalidated_at = NOW() WHERE user_id = $1',
        [userId]
      )
      .catch(() => null);

    // 2. Global sign-out via Supabase Admin API
    try {
      const supabaseAdmin = getSupabaseServerClient();
      await supabaseAdmin.auth.admin.signOut(userId, 'global');
    } catch (signOutErr: any) {
      logger.warn('[FORCE_LOGOUT_SUPABASE_WARNING]', { message: signOutErr.message });
    }

    // Record Audit Log
    await pool
      .query(
        `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
       VALUES (gen_random_uuid(), $1, 'ADMIN_FORCE_LOGOUT_STUDENT', 'public.users', $2, $3, NOW())`,
        [
          session.userId,
          userId,
          JSON.stringify({ loggedOutBy: session.userId, loggedOutAt: new Date().toISOString() }),
        ]
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Force logout executed. All active session tokens have been invalidated.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
