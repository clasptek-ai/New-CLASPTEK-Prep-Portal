export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const attemptRes = await pool.query(
      'SELECT * FROM public.diagnostic_attempts WHERE id = $1 AND student_id = $2 AND deleted_at IS NULL',
      [attemptId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    const attempt = attemptRes.rows[0];

    // Fetch saved candidate answers
    const responsesRes = await pool.query(
      'SELECT question_id, question_version_id, response_payload, time_spent_ms, is_correct FROM public.diagnostic_responses WHERE attempt_id = $1',
      [attemptId]
    );

    const savedAnswers: Record<string, any> = {};
    responsesRes.rows.forEach((r) => {
      savedAnswers[r.question_id] = r.response_payload;
    });

    const paperSnapshot =
      typeof attempt.paper_snapshot === 'string'
        ? JSON.parse(attempt.paper_snapshot)
        : attempt.paper_snapshot || {};

    const startedAt = attempt.started_at || new Date();
    const durationMinutes = attempt.duration_minutes || paperSnapshot.durationMinutes || 45;
    const expiresAt =
      attempt.expires_at || new Date(new Date(startedAt).getTime() + durationMinutes * 60 * 1000);
    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    );

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        studentId: attempt.student_id,
        catalogId: attempt.catalog_id,
        status: attempt.status,
        startedAt,
        expiresAt,
        durationMinutes,
        remainingSeconds,
        score: attempt.score,
      },
      content: {
        grammarQuestions: paperSnapshot.grammarQuestions || [],
        readingPassage: paperSnapshot.readingPassage || null,
        writingTasks: paperSnapshot.writingTasks || [],
      },
      savedAnswers,
      responseCount: responsesRes.rows.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
