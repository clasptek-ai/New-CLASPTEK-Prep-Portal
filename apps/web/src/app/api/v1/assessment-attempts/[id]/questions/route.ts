export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch attempt record
    const attemptRes = await pool.query(
      `SELECT * FROM public.assessment_attempts WHERE id = $1 AND student_id = $2 AND deleted_at IS NULL`,
      [attemptId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    const attempt = attemptRes.rows[0];

    // 2. Fetch saved candidate answers
    const answersRes = await pool.query(
      `SELECT question_id, response_payload, time_spent_ms FROM public.assessment_attempt_answers WHERE attempt_id = $1`,
      [attemptId]
    );

    const savedAnswers: Record<string, any> = {};
    answersRes.rows.forEach((r) => {
      savedAnswers[r.question_id] = r.response_payload;
    });

    // 3. Read EXCLUSIVELY from frozen paper snapshot
    const paperSnapshot = typeof attempt.paper_snapshot === 'string'
      ? JSON.parse(attempt.paper_snapshot)
      : (attempt.paper_snapshot || {});

    // 4. Compute backend-owned server remaining time
    const startedAt = attempt.started_at || new Date();
    const durationMinutes = attempt.duration_minutes || paperSnapshot.durationMinutes || 45;
    const expiresAt = attempt.expires_at || new Date(new Date(startedAt).getTime() + durationMinutes * 60 * 1000);
    const remainingTime = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

    // 5. Append-only event log for attempt resume / question reading
    await pool.query(
      `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
       VALUES ($1, 'QUESTION_OPENED', $2, NOW())`,
      [attemptId, JSON.stringify({ remainingTime })]
    ).catch(() => null);

    const grammarQs = paperSnapshot.grammarQuestions || [];
    const readingPassage = paperSnapshot.readingPassage || null;
    const writingTasks = paperSnapshot.writingTasks || [];
    const totalQuestions = grammarQs.length + (readingPassage ? 1 : 0) + writingTasks.length;

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        assessment: {
          id: attempt.catalog_id,
          title: paperSnapshot.assessment?.title || 'Placement Assessment',
          durationMinutes,
        },
        status: attempt.status,
        remainingTime,
        totalQuestions,
        grammarQuestions: grammarQs,
        readingPassage,
        writingTasks,
        savedAnswers,
        responseCount: answersRes.rows.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 1,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/assessment-attempts/[id]/questions error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
