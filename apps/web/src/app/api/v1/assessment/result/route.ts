export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || searchParams.get('attemptId');

    const { canonicalAssessmentRepo, dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    let placementRow: any = null;
    if (sessionId) {
      const pRes = await pool.query(
        'SELECT * FROM public.placement_results WHERE attempt_id = $1 OR assessment_session_id = $1 OR id = $1 LIMIT 1',
        [sessionId]
      );
      if (pRes.rows.length > 0) {
        placementRow = pRes.rows[0];
      }
    }

    if (!placementRow) {
      const pRes = await pool.query(
        'SELECT * FROM public.placement_results WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
        [studentId]
      );
      if (pRes.rows.length > 0) {
        placementRow = pRes.rows[0];
      }
    }

    if (!placementRow) {
      return NextResponse.json(
        { message: 'No evaluation results found for this assessment session.' },
        { status: 444 }
      );
    }

    const currentAttemptId = placementRow.assessment_session_id || placementRow.attempt_id;

    // Check if any subjective response in this attempt is PENDING rubric evaluation
    const pendingRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM public.diagnostic_responses 
       WHERE attempt_id = $1 AND (response_payload->>'evaluationState' = 'PENDING' OR response_payload->>'textResponse' IS NOT NULL)`,
      [currentAttemptId]
    );

    const hasPendingSubjective = (pendingRes.rows[0]?.count || 0) > 0;
    const placementLifecycle = hasPendingSubjective ? 'EVALUATING' : 'COMPLETED';

    // Query diagnostic_section_scores for granular section breakdowns
    let sectionScores = await canonicalAssessmentRepo.getSectionScores(currentAttemptId);

    // Fallback to student_skill_profiles if diagnostic_section_scores has no rows yet
    if (sectionScores.length === 0) {
      const profilesRes = await pool.query(
        'SELECT skill_code, mastery_percentage, computed_stage FROM public.student_skill_profiles WHERE student_id = $1',
        [studentId]
      );

      sectionScores = profilesRes.rows.map((r: any) => ({
        id: r.skill_code,
        assessmentSessionId: currentAttemptId,
        studentId,
        sectionCode: r.skill_code,
        sectionName: r.skill_code,
        totalQuestions: 5,
        answeredQuestions: 5,
        correctQuestions: Math.round((parseFloat(r.mastery_percentage) / 100) * 5),
        scorePercentage: parseFloat(r.mastery_percentage),
        computedLevel: r.computed_stage,
      }));
    }

    const formattedSections = sectionScores.map((sec) => {
      const isSubjective =
        sec.sectionCode.includes('WRITING') ||
        sec.sectionCode.includes('SPEAKING') ||
        sec.sectionName.includes('Writing') ||
        sec.sectionName.includes('Speaking');

      return {
        ...sec,
        evaluationState: isSubjective && hasPendingSubjective ? 'PENDING_RUBRIC_EVALUATION' : 'SCORED',
      };
    });

    const sortedSections = [...formattedSections].sort((a, b) => b.scorePercentage - a.scorePercentage);
    const strengths = sortedSections.filter((s) => s.scorePercentage >= 55).map((s) => s.sectionName);
    const focusAreas = sortedSections.filter((s) => s.scorePercentage < 55).map((s) => s.sectionName);

    const overallScore =
      formattedSections.length > 0
        ? parseFloat(
            (
              formattedSections.reduce((acc: number, s: any) => acc + s.scorePercentage, 0) /
              formattedSections.length
            ).toFixed(2)
          )
        : 50.0;

    return NextResponse.json({
      success: true,
      resultId: placementRow.id,
      attemptId: placementRow.attempt_id,
      assessmentSessionId: currentAttemptId,
      studentId: placementRow.student_id,
      placementLifecycle, // SUBMITTED | EVALUATING | COMPLETED
      overallScore,
      placementStage: placementRow.placement_stage,
      confidencePercentage: parseFloat(placementRow.confidence_percentage),
      reliabilityScore: parseFloat(placementRow.reliability_score),
      questionsAnswered: placementRow.questions_answered,
      sectionScores: formattedSections,
      strengths: strengths.length > 0 ? strengths : ['Listening'],
      focusAreas: focusAreas.length > 0 ? focusAreas : ['Grammar', 'Writing'],
      recommendedNextStep:
        placementRow.placement_stage === 'INTERMEDIATE'
          ? 'Intermediate English Proficiency Pathway'
          : 'Foundation English Preparation Pathway',
      generatedAt: placementRow.created_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
