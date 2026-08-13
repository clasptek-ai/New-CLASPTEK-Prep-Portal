export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/assessment/result
 * Convenience / candidate result endpoint (reads from public.assessment_results)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attemptIdParam = searchParams.get('attemptId') || searchParams.get('sessionId');

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    let resRow: any = null;

    if (attemptIdParam) {
      const qRes = await pool.query(
        `SELECT * FROM public.assessment_results WHERE attempt_id = $1 AND student_id = $2`,
        [attemptIdParam, studentId]
      );
      resRow = qRes.rows[0];
    }

    if (!resRow) {
      // Fallback: Query latest submitted result for this candidate
      const latestRes = await pool.query(
        `SELECT * FROM public.assessment_results
         WHERE student_id = $1
         ORDER BY generated_at DESC LIMIT 1`,
        [studentId]
      );
      resRow = latestRes.rows[0];
    }

    if (!resRow) {
      return NextResponse.json(
        { success: false, error: 'NO_DIAGNOSTIC_RESULT', message: 'No diagnostic result found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
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
    });
  } catch (err: any) {
    console.error('GET /api/v1/assessment/result error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
