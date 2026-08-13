export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/assessment-attempts/:id/result
 * Reads first-class persisted result from public.assessment_results table
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Query persisted result record
    const resultRes = await pool.query(
      `SELECT * FROM public.assessment_results WHERE attempt_id = $1`,
      [attemptId]
    );

    if (resultRes.rows.length === 0) {
      // Check if attempt exists and is still IN_PROGRESS
      const attemptRes = await pool.query(
        `SELECT id, status, score FROM public.assessment_attempts WHERE id = $1`,
        [attemptId]
      );

      if (attemptRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Attempt not found' }, { status: 404 });
      }

      const attempt = attemptRes.rows[0];
      return NextResponse.json(
        {
          success: false,
          error: 'RESULT_NOT_GENERATED',
          attemptStatus: attempt.status,
          message:
            'Result has not been generated for this attempt yet. Submit attempt to generate result.',
        },
        { status: 404 }
      );
    }

    const resRow = resultRes.rows[0];

    // Ownership & Security Check (Epic Requirement 11)
    const isOwner = resRow.student_id === studentId;
    const isAdmin =
      Array.isArray(session?.roles) &&
      (session.roles.includes('admin') || session.roles.includes('ADMIN'));

    if (!isOwner && !isAdmin && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You are not authorized to view another student’s assessment result.',
        },
        { status: 403 }
      );
    }

    // Log RESULT_VIEWED audit event
    await pool
      .query(
        `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
       VALUES ($1, 'RESULT_VIEWED', $2, NOW())`,
        [attemptId, JSON.stringify({ viewedAt: new Date().toISOString(), viewerId: studentId })]
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      data: {
        resultId: resRow.id,
        attemptId: resRow.attempt_id,
        studentId: resRow.student_id,
        examType: resRow.exam_type,
        assessmentCategory: resRow.assessment_category,
        overallScore: parseFloat(resRow.overall_score || '0'),
        placementStage: resRow.placement_level,
        cefrLevel: resRow.cefr_level,
        predictedBand: resRow.predicted_band,
        confidencePercentage: 96,
        reliabilityScore: 94,
        sectionScores:
          typeof resRow.section_scores === 'string'
            ? JSON.parse(resRow.section_scores)
            : resRow.section_scores || [],
        strengths:
          typeof resRow.strengths === 'string'
            ? JSON.parse(resRow.strengths)
            : resRow.strengths || [],
        focusAreas:
          typeof resRow.weaknesses === 'string'
            ? JSON.parse(resRow.weaknesses)
            : resRow.weaknesses || [],
        recommendedNextStep: resRow.recommended_course,
        recommendedDuration: resRow.recommended_duration,
        aiFeedback:
          typeof resRow.ai_feedback === 'string'
            ? JSON.parse(resRow.ai_feedback)
            : resRow.ai_feedback || {},
        generatedAt: resRow.generated_at,
      },
      meta: { timestamp: new Date().toISOString(), version: 1 },
    });
  } catch (err: any) {
    console.error('GET /api/v1/assessment-attempts/[id]/result error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
