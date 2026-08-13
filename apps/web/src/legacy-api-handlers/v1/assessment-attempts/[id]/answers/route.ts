export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const body = await req.json();
    const { questionId, questionVersionId, answer, timeSpentMs = 0, answers } = body;

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // Verify attempt ownership and active status
    const attemptRes = await pool.query(
      `SELECT id, status FROM public.assessment_attempts WHERE id = $1 AND student_id = $2 AND status = 'IN_PROGRESS'`,
      [attemptId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Attempt not active or unauthorized' },
        { status: 403 }
      );
    }

    // Process batch or single answer
    const answerItems =
      answers && Array.isArray(answers)
        ? answers
        : questionId
          ? [{ questionId, questionVersionId, answer, timeSpentMs }]
          : [];

    let savedCount = 0;
    for (const item of answerItems) {
      const qId = item.questionId;
      const vId = item.questionVersionId || qId;
      const payload = item.answer || item.responsePayload || item;

      // Skip non-UUID question IDs to avoid Postgres 22P02 string_to_uuid syntax errors
      if (qId && typeof qId === 'string' && uuidRegex.test(qId)) {
        const safeVId = vId && typeof vId === 'string' && uuidRegex.test(vId) ? vId : qId;
        await pool.query(
          `INSERT INTO public.assessment_attempt_answers (
            attempt_id, question_id, question_version_id, response_payload, time_spent_ms, updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (attempt_id, question_id) 
          DO UPDATE SET response_payload = EXCLUDED.response_payload, time_spent_ms = EXCLUDED.time_spent_ms, updated_at = NOW()`,
          [attemptId, qId, safeVId, JSON.stringify(payload), Number(item.timeSpentMs || 0)]
        );
        savedCount++;
      }
    }

    // Append-only event log for autosave
    await pool
      .query(
        `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
       VALUES ($1, 'AUTO_SAVE', $2, NOW())`,
        [attemptId, JSON.stringify({ itemCount: savedCount })]
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      data: {
        attemptId,
        savedCount,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 1,
      },
    });
  } catch (err: any) {
    console.error('PATCH /api/v1/assessment-attempts/[id]/answers error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
