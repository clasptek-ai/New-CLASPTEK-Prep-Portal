export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { getSupabaseServerClient } from '@/lib/supabase-client';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json();
    const { status, reason } = body;

    if (!status || !['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value. Must be ACTIVE, SUSPENDED, or PENDING.' },
        { status: 400 }
      );
    }

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminUserStatusRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Verify user existence in public.users or auth.users
    const checkRes = await pool.query(`SELECT id FROM public.users WHERE id = $1`, [userId]);

    if (checkRes.rows.length === 0) {
      // Reconcile user from auth.users if missing in public.users
      const authCheck = await pool.query(`SELECT id FROM auth.users WHERE id = $1`, [userId]);
      if (authCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Candidate user record not found.' },
          { status: 404 }
        );
      }
      await pool.query(
        `INSERT INTO public.users (id, status, version, created_at, updated_at)
         VALUES ($1, $2, 1, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET status = $2, updated_at = NOW()`,
        [userId, status]
      );
    } else {
      // 2. Persist status change in PostgreSQL public.users
      await pool.query(
        `UPDATE public.users
         SET status = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [status, userId]
      );
    }

    // 3. Update security_profiles lock_status if table exists
    try {
      await pool.query(
        `UPDATE public.security_profiles
         SET lock_status = $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [status === 'SUSPENDED' ? 'LOCKED' : 'UNLOCKED', userId]
      );
    } catch {
      // Fallback if table doesn't exist
    }

    // 4. Session Revocation / Supabase Ban Handling
    const supabaseAdmin = getSupabaseServerClient();
    if (status === 'SUSPENDED') {
      try {
        // Revoke active sessions / sign out globally
        await supabaseAdmin.auth.admin.signOut(userId, 'global');
        // Apply ban duration in Supabase Auth to prevent new token issue
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: '87600h', // 10 years
        });
      } catch (authErr: unknown) {
        const errObj = authErr instanceof Error ? authErr : new Error(String(authErr));
        logger.error('[SUPABASE_SESSION_REVOCATION_ERROR]', errObj, { userId });
      }
    } else if (status === 'ACTIVE') {
      try {
        // Lift ban duration in Supabase Auth to restore login
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: 'none',
        });
      } catch (authErr: unknown) {
        const errObj = authErr instanceof Error ? authErr : new Error(String(authErr));
        logger.error('[SUPABASE_UNBAN_ERROR]', errObj, { userId });
      }
    }

    // 5. Audit Logging
    try {
      await pool.query(
        `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
         VALUES (gen_random_uuid(), $1, 'ADMIN_UPDATE_USER_STATUS', 'public.users', $2, $3, NOW())`,
        [session.userId, userId, JSON.stringify({ status, reason: reason || 'N/A' })]
      );
    } catch (auditErr: unknown) {
      const errObj = auditErr instanceof Error ? auditErr : new Error(String(auditErr));
      logger.warn('[AUDIT_LOG_WARNING]', { error: errObj.message });
    }

    return NextResponse.json(
      {
        success: true,
        status,
        message: `Candidate status successfully updated to ${status}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('[ADMIN_UPDATE_STATUS_HANDLER_ERROR]', err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
