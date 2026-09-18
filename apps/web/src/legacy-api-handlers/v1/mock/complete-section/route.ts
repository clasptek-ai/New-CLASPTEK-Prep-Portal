export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

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
          `[MOCK_LATE_COMPLETE_SECTION_REJECTED] sessionId=${sessionId} expired=${expired} finalized=${finalized}`
        );
        return NextResponse.json(
          { error: 'MOCK_EXPIRED', message: 'The examination time has expired.' },
          { status: 403 }
        );
      }
    }

    const ctx = getMockExaminationContext();
    await ctx.completeSection.execute({ sessionId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
