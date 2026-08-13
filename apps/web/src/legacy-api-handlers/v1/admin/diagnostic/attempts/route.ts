export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);

    // Verify Admin or Instructor role
    const isStaff = session?.roles.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const attemptsRes = await pool.query(
      `SELECT 
        da.id as attempt_id,
        da.student_id,
        da.catalog_id,
        da.status as attempt_status,
        da.started_at,
        da.closed_at,
        da.score,
        pr.placement_stage,
        pr.confidence_percentage,
        pr.reliability_score,
        pr.questions_answered
       FROM public.diagnostic_attempts da
       LEFT JOIN public.placement_results pr ON pr.attempt_id = da.id OR pr.assessment_session_id = da.id
       ORDER BY da.created_at DESC
       LIMIT 50`
    );

    const attempts = await Promise.all(
      attemptsRes.rows.map(async (row) => {
        // Query section scores
        const secRes = await pool.query(
          `SELECT section_code, section_name, score_percentage, computed_level 
           FROM public.diagnostic_section_scores 
           WHERE assessment_session_id = $1`,
          [row.attempt_id]
        );

        // Query pending response status
        const pendingRes = await pool.query(
          `SELECT COUNT(*)::int as pending_count 
           FROM public.diagnostic_responses 
           WHERE attempt_id = $1 AND response_payload->>'evaluationState' = 'PENDING'`,
          [row.attempt_id]
        );

        const pendingCount = pendingRes.rows[0]?.pending_count || 0;

        return {
          attemptId: row.attempt_id,
          studentId: row.student_id,
          catalogId: row.catalog_id,
          status: row.attempt_status,
          placementStage: row.placement_stage || 'PENDING_EVALUATION',
          overallScore: row.score ? parseFloat(row.score) : 0,
          confidencePercentage: row.confidence_percentage
            ? parseFloat(row.confidence_percentage)
            : 0,
          reliabilityScore: row.reliability_score ? parseFloat(row.reliability_score) : 0,
          questionsAnswered: row.questions_answered || 0,
          startedAt: row.started_at,
          closedAt: row.closed_at,
          hasPendingEvaluation: pendingCount > 0,
          sectionScores: secRes.rows.map((s) => ({
            sectionCode: s.section_code,
            sectionName: s.section_name,
            scorePercentage: parseFloat(s.score_percentage),
            computedLevel: s.computed_level,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      totalAttempts: attempts.length,
      attempts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
