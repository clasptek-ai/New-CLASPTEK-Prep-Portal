export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, errorResponse } = await requireAdminSession(req);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    // Protect self-deletion
    if (session.userId === userId) {
      return NextResponse.json(
        { success: false, message: 'An administrator cannot delete their own account.' },
        { status: 400 }
      );
    }

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('DeleteUserRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Verify target user exists and is not super admin
    const checkRes = await pool.query(
      `SELECT u.id, i.email 
       FROM public.users u 
       LEFT JOIN public.identities i ON u.id = i.user_id 
       WHERE u.id = $1`,
      [userId]
    );

    if (checkRes.rows.length === 0) {
      // Check if user exists in auth.users alone
      const supabaseAdmin = getSupabaseServerClient();
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authUserData?.user) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json({
          success: true,
          message: 'Orphaned auth account removed successfully.',
        });
      }

      return NextResponse.json(
        { success: false, message: 'User account not found' },
        { status: 404 }
      );
    }

    const targetEmail = checkRes.rows[0].email || '';
    if (targetEmail.toLowerCase().trim() === 'clasptek@gmail.com') {
      return NextResponse.json(
        { success: false, message: 'System administrator account cannot be deleted.' },
        { status: 403 }
      );
    }

    const isValidUuid = (s?: string | null) =>
      s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const deletedByUuid = isValidUuid(session.userId) ? session.userId : null;

    // 2. Execute transactional deletion of application records
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM public.security_profiles WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.user_roles WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.identities WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.profiles WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.student_programme_enrollments WHERE student_id = $1', [
        userId,
      ]);
      await client.query('DELETE FROM public.users WHERE id = $1', [userId]);

      // Record Audit Log before commit
      await client
        .query(
          `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
         VALUES (gen_random_uuid(), $1, 'ADMIN_DELETED_STUDENT', 'public.users', $2, $3, NOW())`,
          [
            deletedByUuid,
            userId,
            JSON.stringify({
              deletedBy: session.userId,
              deletedEmail: targetEmail,
              deletedAt: new Date().toISOString(),
            }),
          ]
        )
        .catch(() => null);

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

    // 3. Complete deletion in Supabase Auth via Admin API
    try {
      const supabaseAdmin = getSupabaseServerClient();
      await supabaseAdmin.auth.admin.signOut(userId, 'global');
      await supabaseAdmin.auth.admin.deleteUser(userId);
      logger.info(`[USER_DELETED] Successfully removed auth.users record for ${userId}`);
    } catch (authErr) {
      logger.warn('[SUPABASE_DELETE_USER_WARNING]', { error: String(authErr) });
    }

    return NextResponse.json({
      success: true,
      message: 'Student account and auth credentials have been completely deleted.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
