export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { sessionId, sectionIndex } = body;

    if (sessionId) {
      const { dbPool } = await getDiagnosticContext();
      const pool = dbPool.getPool();
      const sessionRes = await pool.query(
        `SELECT status, expires_at FROM public.mock_sessions WHERE id = $1 LIMIT 1`,
        [sessionId]
      );
      if (sessionRes.rows.length > 0) {
        const { status, expires_at } = sessionRes.rows[0];
        const expired = expires_at && Date.now() >= new Date(expires_at).getTime();
        const finalized = status === 'SUBMITTED' || status === 'COMPLETED';
        if (expired || finalized) {
          console.warn(
            `[MOCK_LATE_SUBMIT_SECTION_REJECTED] sessionId=${sessionId} expired=${expired} finalized=${finalized}`
          );
          return NextResponse.json(
            { error: 'MOCK_EXPIRED', message: 'The examination time has expired.' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      sectionIndex,
      isSectionLocked: true,
      nextSectionIndex: sectionIndex + 1,
      message: 'Section submitted and locked.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
