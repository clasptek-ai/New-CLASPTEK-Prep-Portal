export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId;

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
            `[MOCK_LATE_SAVE_REJECTED] sessionId=${sessionId} expired=${expired} finalized=${finalized}`
          );
          return NextResponse.json(
            { error: 'MOCK_EXPIRED', message: 'The examination time has expired.' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: body.sessionId || 'msession-1',
        savedAnswersCount: Object.keys(body.answers || {}).length,
        savedAt: new Date().toISOString(),
        message: 'Mock examination state saved successfully.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
