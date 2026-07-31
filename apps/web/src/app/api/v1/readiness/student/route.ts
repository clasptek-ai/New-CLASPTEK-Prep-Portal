export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Query Diagnostic baseline score
    const diagRes = await pool.query(
      `SELECT pr.confidence_percentage, pr.placement_stage, dss.score_percentage
       FROM public.placement_results pr
       LEFT JOIN public.diagnostic_section_scores dss ON dss.assessment_session_id = pr.assessment_session_id OR dss.assessment_session_id = pr.attempt_id
       WHERE pr.student_id = $1
       ORDER BY pr.created_at DESC LIMIT 10`,
      [studentId]
    );

    // 2. Query Practice mastery scores
    const practiceRes = await pool.query(
      `SELECT AVG(score_percentage)::numeric as avg_score, COUNT(*)::int as count 
       FROM public.practice_sessions 
       WHERE student_id = $1 AND status = 'COMPLETED' AND deleted_at IS NULL`,
      [studentId]
    );

    // 3. Query Mock exam scores
    const mockRes = await pool.query(
      `SELECT AVG(score_percentage)::numeric as avg_score, COUNT(*)::int as count 
       FROM public.mock_sessions 
       WHERE student_id = $1 AND (status = 'COMPLETED' OR status = 'SUBMITTED')`,
      [studentId]
    );

    let diagnosticScore: number | null = null;
    if (diagRes.rows.length > 0) {
      const scores = diagRes.rows.filter((r) => r.score_percentage !== null).map((r) => parseFloat(r.score_percentage));
      if (scores.length > 0) {
        diagnosticScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      } else {
        diagnosticScore = diagRes.rows[0].placement_stage === 'INTERMEDIATE' ? 70 : 45;
      }
    }

    const practiceScore = practiceRes.rows[0]?.avg_score ? parseFloat(practiceRes.rows[0].avg_score) : null;
    const mockScore = mockRes.rows[0]?.avg_score ? parseFloat(mockRes.rows[0].avg_score) : null;

    // Weight evidence dynamically based on available activities
    let overallReadiness = 0;
    let totalWeight = 0;

    if (diagnosticScore !== null) {
      overallReadiness += diagnosticScore * 0.3;
      totalWeight += 0.3;
    }
    if (practiceScore !== null) {
      overallReadiness += practiceScore * 0.3;
      totalWeight += 0.3;
    }
    if (mockScore !== null) {
      overallReadiness += mockScore * 0.4;
      totalWeight += 0.4;
    }

    const finalReadiness = totalWeight > 0 ? Math.round(overallReadiness / totalWeight) : 0;
    const riskLevel =
      totalWeight === 0
        ? 'PENDING_EVALUATION'
        : finalReadiness >= 75
          ? 'LOW'
          : finalReadiness >= 55
            ? 'MEDIUM'
            : 'HIGH';

    return NextResponse.json({
      success: true,
      overallReadiness: finalReadiness,
      targetScore: 85,
      confidenceRange: {
        min: Math.max(0, finalReadiness - 5),
        max: Math.min(100, finalReadiness + 5),
      },
      riskLevel,
      hasDiagnostic: diagnosticScore !== null,
      hasPractice: practiceScore !== null,
      hasMock: mockScore !== null,
      priorityStudyPlan:
        finalReadiness >= 75
          ? 'Complete mock exam simulation to finalize examination readiness.'
          : 'Complete targeted practice modules in lower scoring sections.',
      weakDomains: finalReadiness < 60 ? ['Grammar & Structure', 'Writing Expression'] : ['Writing Expression'],
      strongDomains: finalReadiness >= 60 ? ['Reading Comprehension', 'Listening Comprehension'] : ['Reading Comprehension'],
      suggestedPracticePlan: 'Complete targeted practice sessions to improve skill mastery.',
      readinessTrend: finalReadiness > 0 ? [finalReadiness] : [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
