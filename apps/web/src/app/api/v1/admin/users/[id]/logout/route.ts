export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { loadEnvironment } from '@clasptek/configuration';
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
    const logger = new ConsoleLogger('ForceLogoutRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // Global sign-out via Supabase Admin API
    const supabaseAdmin = getSupabaseServerClient();
    const { error: signOutErr } = await supabaseAdmin.auth.admin.signOut(userId, 'global');

    if (signOutErr) {
      return NextResponse.json(
        { success: false, message: signOutErr.message || 'Failed to invalidate active sessions.' },
        { status: 500 }
      );
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
