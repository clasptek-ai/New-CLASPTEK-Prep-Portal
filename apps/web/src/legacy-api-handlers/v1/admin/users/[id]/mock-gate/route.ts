import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, errorResponse } = await requireAdminSession(req);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing user ID' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { locked, reason } = body;

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('MockGateRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // Determine current state if locked not explicitly provided
    let newLockedState = Boolean(locked);
    if (locked === undefined) {
      const currentRes = await pool.query(
        'SELECT mock_gate_locked FROM public.users WHERE id = $1',
        [userId]
      );
      if (currentRes.rows.length > 0) {
        newLockedState = !currentRes.rows[0].mock_gate_locked;
      }
    }

    const isValidUuid = (s?: string | null) =>
      s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
    const updatedByUuid = isValidUuid(session.userId) ? session.userId : null;

    // Update public.users mock gate state
    await pool.query(
      `UPDATE public.users
       SET mock_gate_locked = $1,
           mock_gate_reason = $2,
           mock_gate_updated_at = NOW(),
           mock_gate_updated_by = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [newLockedState, reason || null, updatedByUuid, userId]
    );

    // Audit Log
    await pool
      .query(
        `INSERT INTO public.audit_logs (id, user_id, action, entity, entity_id, payload, created_at)
       VALUES (gen_random_uuid(), $1, 'ADMIN_TOGGLED_MOCK_GATE', 'public.users', $2, $3, NOW())`,
        [session.userId, userId, JSON.stringify({ mock_gate_locked: newLockedState, reason })]
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      mockUnlocked: !newLockedState,
      message: `Mock Exam gate access ${newLockedState ? 'locked' : 'unlocked'} successfully.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
