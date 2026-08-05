export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { PostgresCanonicalPracticeRepository } from '@clasptek/persistence';
import { calculateBandOrScaleScore } from '@/services/student/practice.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await req.json();
    const answers = body.answers || {};
    const timeSpentSeconds = typeof body.timeSpentSeconds === 'number' ? body.timeSpentSeconds : 60;

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();
    const practiceRepo = new PostgresCanonicalPracticeRepository(pool);

    const sessionRecord = await practiceRepo.getSessionById(sessionId);
    if (!sessionRecord) {
      return NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
    }

    // Verify session ownership
    if (sessionRecord.student_id !== studentId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden: Access denied to session' }, { status: 403 });
    }

    // Server-side scoring against answer_options
    let correctCount = 0;
    const answerEntries = Object.entries(answers);
    const totalQuestions = sessionRecord.total_questions || answerEntries.length || 1;

    for (const [qId, ans] of answerEntries) {
      const qAns = ans as any;
      const userCode = qAns.userAnswer || qAns.selectedOptionCode;
      const qVersionId = qAns.questionVersionId || qId;

      if (userCode) {
        const evalResult = await practiceRepo.evaluateObjectiveAnswer(qVersionId, userCode);
        if (evalResult.isCorrect) {
          correctCount++;
        }
      }
    }

    const scorePercentage = parseFloat(((correctCount / totalQuestions) * 100).toFixed(2));
    const bandResult = calculateBandOrScaleScore(
      sessionRecord.exam_type || 'English Proficiency',
      correctCount,
      totalQuestions
    );

    // Complete practice session in DB
    await practiceRepo.completeSession(sessionId, {
      durationMs: timeSpentSeconds * 1000,
      answeredQuestions: answerEntries.length,
      correctQuestions: correctCount,
      scorePercentage,
      bandOrScale: bandResult.bandOrScale,
    });

    // Update ongoing Practice skill evidence in student_skill_profiles
    const computedStage =
      scorePercentage >= 75
        ? 'MASTERED'
        : scorePercentage >= 50
          ? 'DEVELOPING'
          : 'NEEDS_IMPROVEMENT';

    await pool.query(
      `INSERT INTO public.student_skill_profiles 
       (id, student_id, skill_code, mastery_percentage, computed_stage, assessment_session_id, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())
       ON CONFLICT (student_id, skill_code) DO UPDATE SET
         mastery_percentage = EXCLUDED.mastery_percentage,
         computed_stage = EXCLUDED.computed_stage,
         updated_at = now()`,
      [
        studentId,
        sessionRecord.section_code || 'Grammar',
        scorePercentage,
        computedStage,
        sessionId,
      ]
    );

    return NextResponse.json({
      success: true,
      sessionId,
      totalQuestions,
      correctCount,
      scorePercentage,
      bandOrScale: bandResult.bandOrScale,
      label: bandResult.label,
      computedStage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
