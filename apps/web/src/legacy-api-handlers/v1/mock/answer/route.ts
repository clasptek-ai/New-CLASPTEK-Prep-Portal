export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getMockExaminationContext } from '@/lib/mock-examination-context';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, studentId, questionId, sectionId, answerPayload, timeSpentMs } = body;

    if (!sessionId || !questionId || !sectionId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const sessionRes = await pool.query(
      `SELECT student_id, tenant_id, status, expires_at FROM public.mock_sessions WHERE id = $1 LIMIT 1`,
      [sessionId]
    );

    if (sessionRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'MOCK_SESSION_NOT_FOUND', message: 'Mock session not found.' },
        { status: 404 }
      );
    }

    const { status, expires_at } = sessionRes.rows[0];
    const expired = expires_at && Date.now() >= new Date(expires_at).getTime();
    const finalized = status === 'SUBMITTED' || status === 'COMPLETED';

    if (expired || finalized) {
      console.warn(
        `[MOCK_LATE_MUTATION_REJECTED] sessionId=${sessionId} questionId=${questionId} expired=${expired} finalized=${finalized}`
      );
      return NextResponse.json(
        { error: 'MOCK_EXPIRED', message: 'The examination time has expired.' },
        { status: 403 }
      );
    }

    const ctx = getMockExaminationContext();
    await ctx.submitAnswer.execute({
      sessionId,
      studentId: studentId ?? 'anon-student',
      questionId,
      sectionId,
      answerPayload,
      timeSpentMs: timeSpentMs ?? 0,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
