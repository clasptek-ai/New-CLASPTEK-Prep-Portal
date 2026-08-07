export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { getSupabaseServerClient } from '@/lib/supabase-client';

/**
 * POST /api/v1/admin/users/:id/unlock-account
 * Admin API to immediately unlock a locked candidate account:
 * - Clears lock_status = 'UNLOCKED', failed_attempts = 0, locked_at = NULL, lock_expires_at = NULL in public.security_profiles
 * - Unbans in Supabase Auth if banned (ban_duration = 'none')
 * - Writes to public.audit_logs
 */
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
        { success: false, message: 'Unauthorized. Admin credentials required to unlock accounts.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('UnlockAccountRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Reset security_profiles lock state in PostgreSQL
    await pool.query(
      `UPDATE public.security_profiles
       SET lock_status = 'UNLOCKED',
           failed_attempts = 0,
           locked_at = NULL,
           lock_expires_at = NULL,
           updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );

    // 2. Unban user in Supabase Auth if banned
    try {
      const supabaseAdmin = getSupabaseServerClient();
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      });
    } catch (authErr) {
      logger.warn('[SUPABASE_UNBAN_WARNING]', { error: String(authErr) });
    }

    // 3. Record Audit Log
    await pool
      .query(
        `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
       VALUES (gen_random_uuid(), $1, 'ADMIN_UNLOCKED_ACCOUNT', 'public.security_profiles', $2, $3, NOW())`,
        [
          session.userId,
          userId,
          JSON.stringify({ unlockedBy: session.userId, unlockedAt: new Date().toISOString() }),
        ]
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Account lock cleared successfully. Candidate can log in immediately.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
