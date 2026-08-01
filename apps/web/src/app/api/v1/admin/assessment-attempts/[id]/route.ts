export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/assessment-attempts/:id
 * Detailed Frozen Paper Snapshot Review Endpoint for Admin Console
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);

    // Verify Admin or Staff role
    const isStaff = session?.roles?.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch Attempt Record
    const attemptRes = await pool.query(
      `SELECT 
        aa.*, 
        au.email as student_email, 
        COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as student_name
       FROM public.assessment_attempts aa
       LEFT JOIN auth.users au ON (au.id::text = aa.student_id::text)
       LEFT JOIN public.profiles p ON (p.user_id = aa.student_id OR p.id = aa.student_id)
       WHERE aa.id = $1`,
      [attemptId]
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Attempt not found' }, { status: 404 });
    }

    const attempt = attemptRes.rows[0];

    // 2. Fetch Stored Assessment Result
    const resultRes = await pool.query(
      `SELECT * FROM public.assessment_results WHERE attempt_id = $1`,
      [attemptId]
    );
    const result = resultRes.rows[0] || null;

    // 3. Fetch Candidate Answers
    const answersRes = await pool.query(
      `SELECT question_id, response_payload, is_correct, time_spent_ms, updated_at
       FROM public.assessment_attempt_answers
       WHERE attempt_id = $1`,
      [attemptId]
    );

    const answersMap: Record<string, any> = {};
    answersRes.rows.forEach((r) => {
      answersMap[r.question_id] = {
        responsePayload: r.response_payload,
        isCorrect: r.is_correct,
        timeSpentMs: r.time_spent_ms,
        updatedAt: r.updated_at,
      };
    });

    // 4. Fetch Event Audit Log Timeline
    const eventsRes = await pool.query(
      `SELECT id, event_type, event_payload, created_at
       FROM public.assessment_attempt_events
       WHERE attempt_id = $1
       ORDER BY created_at ASC`,
      [attemptId]
    );

    const auditTimeline = eventsRes.rows.map((e) => ({
      id: e.id,
      eventType: e.event_type,
      payload: typeof e.event_payload === 'string' ? JSON.parse(e.event_payload) : e.event_payload,
      timestamp: e.created_at,
    }));

    // Log ADMIN_REVIEWED event
    await pool
      .query(
        `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
       VALUES ($1, 'ADMIN_REVIEWED', $2, NOW())`,
        [
          attemptId,
          JSON.stringify({
            reviewedAt: new Date().toISOString(),
            adminId: session?.userId || 'system-admin',
          }),
        ]
      )
      .catch(() => null);

    const paperSnapshot =
      typeof attempt.paper_snapshot === 'string'
        ? JSON.parse(attempt.paper_snapshot)
        : attempt.paper_snapshot || {};

    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          studentId: attempt.student_id,
          studentName: attempt.student_name || 'Candidate',
          studentEmail: attempt.student_email || 'student@clasptek.ai',
          status: attempt.status,
          score: attempt.score ? parseFloat(attempt.score) : 0,
          durationMinutes: attempt.duration_minutes,
          startedAt: attempt.started_at,
          submittedAt: attempt.closed_at,
          expiresAt: attempt.expires_at,
        },
        result: result
          ? {
              overallScore: parseFloat(result.overall_score || '0'),
              cefrLevel: result.cefr_level,
              predictedBand: result.predicted_band,
              placementLevel: result.placement_level,
              recommendedCourse: result.recommended_course,
              recommendedDuration: result.recommended_duration,
              sectionScores:
                typeof result.section_scores === 'string'
                  ? JSON.parse(result.section_scores)
                  : result.section_scores,
              strengths:
                typeof result.strengths === 'string'
                  ? JSON.parse(result.strengths)
                  : result.strengths,
              weaknesses:
                typeof result.weaknesses === 'string'
                  ? JSON.parse(result.weaknesses)
                  : result.weaknesses,
              aiFeedback:
                typeof result.ai_feedback === 'string'
                  ? JSON.parse(result.ai_feedback)
                  : result.ai_feedback,
            }
          : null,
        answers: answersMap,
        paperSnapshot,
        auditTimeline,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/assessment-attempts/[id] error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
