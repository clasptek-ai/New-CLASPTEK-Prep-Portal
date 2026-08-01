export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch attempt and paper snapshot
    const attemptRes = await pool.query(
      `SELECT * FROM public.assessment_attempts WHERE id = $1 AND student_id = $2 AND status = 'IN_PROGRESS'`,
      [attemptId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Attempt not active or unauthorized' },
        { status: 404 }
      );
    }

    const attempt = attemptRes.rows[0];

    // 2. Fetch candidate answers
    const answersRes = await pool.query(
      `SELECT question_id, response_payload, is_correct FROM public.assessment_attempt_answers WHERE attempt_id = $1`,
      [attemptId]
    );

    const savedAnswers = new Map<string, any>();
    answersRes.rows.forEach((r) => {
      savedAnswers.set(r.question_id, r.response_payload);
    });

    const paperSnapshot = typeof attempt.paper_snapshot === 'string'
      ? JSON.parse(attempt.paper_snapshot)
      : (attempt.paper_snapshot || {});

    const grammarQs = paperSnapshot.grammarQuestions || [];
    let correctGrammar = 0;

    grammarQs.forEach((q: any) => {
      const resp = savedAnswers.get(q.id);
      if (resp) {
        const selCode = typeof resp === 'string' ? resp : resp.code || resp.answer || resp.selectedOption;
        // Basic check or placeholder scoring
        if (selCode) {
          correctGrammar++;
        }
      }
    });

    const grammarPercentage = grammarQs.length > 0 ? (correctGrammar / grammarQs.length) * 100 : 75;
    let computedLevel = 'INTERMEDIATE';
    if (grammarPercentage >= 80) computedLevel = 'ADVANCED';
    else if (grammarPercentage < 50) computedLevel = 'FOUNDATION';

    // 3. Update attempt status to SUBMITTED & store score
    await pool.query(
      `UPDATE public.assessment_attempts 
       SET status = 'SUBMITTED', closed_at = NOW(), score = $1, updated_at = NOW() 
       WHERE id = $2`,
      [grammarPercentage, attemptId]
    );

    // 4. Log SUBMITTED event in assessment_attempt_events
    await pool.query(
      `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
       VALUES ($1, 'SUBMITTED', $2, NOW())`,
      [attemptId, JSON.stringify({ score: grammarPercentage, computedLevel })]
    ).catch(() => null);

    return NextResponse.json({
      success: true,
      data: {
        attemptId,
        status: 'SUBMITTED',
        score: Math.round(grammarPercentage * 100) / 100,
        computedLevel,
        submittedAt: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 1,
      },
    });
  } catch (err: any) {
    console.error('POST /api/v1/assessment-attempts/[id]/submit error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
