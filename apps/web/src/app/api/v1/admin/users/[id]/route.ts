export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const logger = new ConsoleLogger('DeleteUserRoute');

  try {
    const { session, errorResponse } = await requireAdminSession(req);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const rawTargetId = resolvedParams.id?.trim();
    if (!rawTargetId) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    const config = loadEnvironment(process.env);
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Resolve canonical identity chain across auth.users, public.users, identities, profiles, and enrollments
    const lookupRes = await pool.query(
      `SELECT 
        u.id AS user_id,
        au.id AS auth_id,
        COALESCE(i.email, au.email, p.first_name) AS email
       FROM public.users u
       FULL OUTER JOIN auth.users au ON au.id = u.id
       LEFT JOIN public.identities i ON i.user_id = COALESCE(u.id, au.id)
       LEFT JOIN public.profiles p ON p.user_id = COALESCE(u.id, au.id)
       WHERE u.id::text = $1 
          OR au.id::text = $1 
          OR au.email ILIKE $1 
          OR i.email ILIKE $1 
          OR i.login_identifier ILIKE $1
          OR p.id::text = $1
       LIMIT 1`,
      [rawTargetId]
    );

    let resolvedUserId: string | null = null;
    let resolvedAuthId: string | null = null;
    let targetEmail: string = '';

    if (lookupRes.rows.length > 0) {
      const row = lookupRes.rows[0];
      resolvedUserId = row.user_id || row.auth_id;
      resolvedAuthId = row.auth_id || row.user_id;
      targetEmail = row.email || '';
    } else {
      // Check Supabase Auth directly via Admin API in case DB table pointers were purged
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        rawTargetId
      );

      if (isValidUuid) {
        try {
          const supabaseAdmin = getSupabaseServerClient();
          const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(rawTargetId);
          if (authUserData?.user) {
            resolvedUserId = authUserData.user.id;
            resolvedAuthId = authUserData.user.id;
            targetEmail = authUserData.user.email || '';
          }
        } catch {
          // Auth user lookup error
        }
      }

      // If still not resolved:
      if (!resolvedUserId) {
        if (isValidUuid) {
          // Idempotent Case D: Record was already completely deleted
          return NextResponse.json({
            success: true,
            code: 'ALREADY_DELETED',
            message: 'Student account was already removed.',
          });
        }

        // Case E: Genuinely invalid identifier
        return NextResponse.json(
          {
            success: false,
            code: 'USER_NOT_FOUND',
            message: 'Student account not found.',
          },
          { status: 404 }
        );
      }
    }

    // 2. Protect self-deletion & system super admin
    if (session.userId === resolvedUserId || session.userId === resolvedAuthId) {
      return NextResponse.json(
        { success: false, message: 'An administrator cannot delete their own account.' },
        { status: 400 }
      );
    }

    if (targetEmail.toLowerCase().trim() === 'clasptek@gmail.com') {
      return NextResponse.json(
        { success: false, message: 'System administrator account cannot be deleted.' },
        { status: 403 }
      );
    }

    const isValidUuid = (s?: string | null) =>
      s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const deletedByUuid = isValidUuid(session.userId) ? session.userId : null;
    const targetUuid = resolvedUserId || rawTargetId;

    // 3. Execute transactional, foreign-key safe deletion of application records
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Dependent Student Domain Tables
      await client.query('DELETE FROM public.student_programme_enrollments WHERE student_id = $1', [
        targetUuid,
      ]);
      await client
        .query(
          `DELETE FROM public.assessment_attempt_answers 
         WHERE attempt_id IN (SELECT id FROM public.assessment_attempts WHERE student_id = $1)`,
          [targetUuid]
        )
        .catch(() => null);
      await client
        .query(
          `DELETE FROM public.assessment_attempt_events 
         WHERE attempt_id IN (SELECT id FROM public.assessment_attempts WHERE student_id = $1)`,
          [targetUuid]
        )
        .catch(() => null);
      await client
        .query('DELETE FROM public.assessment_results WHERE student_id = $1', [targetUuid])
        .catch(() => null);
      await client
        .query('DELETE FROM public.assessment_attempts WHERE student_id = $1', [targetUuid])
        .catch(() => null);

      // Core Identity & Auth Subsystem Tables
      await client.query('DELETE FROM public.security_profiles WHERE user_id = $1', [targetUuid]);
      await client.query('DELETE FROM public.user_roles WHERE user_id = $1', [targetUuid]);
      await client.query('DELETE FROM public.identities WHERE user_id = $1', [targetUuid]);
      await client.query('DELETE FROM public.profiles WHERE user_id = $1', [targetUuid]);
      await client.query('DELETE FROM public.users WHERE id = $1', [targetUuid]);

      // Audit Log
      await client
        .query(
          `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
         VALUES (gen_random_uuid(), $1, 'ADMIN_DELETED_STUDENT', 'public.users', $2, $3, NOW())`,
          [
            deletedByUuid,
            targetUuid,
            JSON.stringify({
              deletedBy: session.userId,
              deletedEmail: targetEmail,
              rawInput: rawTargetId,
              deletedAt: new Date().toISOString(),
            }),
          ]
        )
        .catch(() => null);

      await client.query('COMMIT');
    } catch (txErr: unknown) {
      await client.query('ROLLBACK');
      logger.error(
        '[DB_DELETE_TRANSACTION_ERROR]',
        txErr instanceof Error ? txErr : new Error(String(txErr))
      );
      throw txErr;
    } finally {
      client.release();
    }

    // 4. Complete Supabase Auth deletion safely and idempotently
    const authIdToDelete = resolvedAuthId || (isValidUuid(rawTargetId) ? rawTargetId : null);
    if (authIdToDelete) {
      try {
        const supabaseAdmin = getSupabaseServerClient();
        await supabaseAdmin.auth.admin.signOut(authIdToDelete, 'global').catch(() => null);
        const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(authIdToDelete);
        if (
          deleteAuthErr &&
          !deleteAuthErr.message?.toLowerCase().includes('not found') &&
          (deleteAuthErr as any).status !== 404
        ) {
          logger.warn('[SUPABASE_AUTH_DELETE_WARNING]', { error: deleteAuthErr.message });
        } else {
          logger.info(`[USER_DELETED] Removed auth.users record for ${authIdToDelete}`);
        }
      } catch (authErr) {
        logger.warn('[SUPABASE_DELETE_USER_EXCEPTION]', { error: String(authErr) });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Student account and auth credentials have been completely deleted.',
    });
  } catch (err: unknown) {
    logger.error(
      '[ADMIN_DELETE_STUDENT_ENDPOINT_ERROR]',
      err instanceof Error ? err : new Error(String(err))
    );
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
