export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { getSupabaseServerClient } from '@/lib/supabase-client';

/**
 * DELETE /api/v1/admin/users/:id
 * Soft Deletes / Archives candidate student account:
 * - Updates public.users setting deleted_at = NOW(), deleted_by = $1, is_deleted = TRUE, status = 'ARCHIVED'
 * - Invalidation of global active sessions via Supabase Admin API
 * - Bans user token issuance in Supabase Auth
 * - PRESERVES historical assessment_attempts, assessment_results, certificates, and audit_logs!
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const isSuperAdmin =
      session &&
      session.roles.some((r) =>
        ['SUPER_ADMIN', 'SUPER_ADMINISTRATOR', 'ADMINISTRATOR'].includes(r)
      );

    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Administrator credentials required to archive accounts.',
        },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('DeleteUserRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Verify user exists
    const checkRes = await pool.query('SELECT id, status FROM public.users WHERE id = $1', [
      userId,
    ]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Candidate user not found' },
        { status: 404 }
      );
    }

    const isValidUuid = (s?: string | null) =>
      s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const deletedByUuid = isValidUuid(session.userId) ? session.userId : null;

    // 2. Soft Delete in public.users
    await pool.query(
      `UPDATE public.users
       SET deleted_at = NOW(),
           deleted_by = $1,
           is_deleted = TRUE,
           status = 'ARCHIVED',
           updated_at = NOW()
       WHERE id = $2`,
      [deletedByUuid, userId]
    );

    // 3. Invalidate active sessions globally in Supabase Auth
    try {
      const supabaseAdmin = getSupabaseServerClient();
      await supabaseAdmin.auth.admin.signOut(userId, 'global');
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '87600h',
      });
    } catch (authErr) {
      logger.warn('[SUPABASE_SIGN_OUT_WARNING]', { error: String(authErr) });
    }

    // 4. Record Audit Log
    await pool
      .query(
        `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
       VALUES (gen_random_uuid(), $1, 'ADMIN_ARCHIVED_STUDENT', 'public.users', $2, $3, NOW())`,
        [
          session.userId,
          userId,
          JSON.stringify({ archivedBy: session.userId, archivedAt: new Date().toISOString() }),
        ]
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Student account has been safely archived and session tokens revoked.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
