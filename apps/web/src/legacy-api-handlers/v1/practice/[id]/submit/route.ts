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

    // Server-side scoring against answer_options and question_versions
    let correctCount = 0;
    const answerEntries = Object.entries(answers);

    // Fetch snapshotted questions for this practice session if available
    const sessionQuestionsRes = await pool.query(
      `SELECT psq.question_version_id, psq.order_index, q.id as question_id, q.code, qv.payload, qv.explanation
       FROM public.practice_session_questions psq
       JOIN public.question_versions qv ON qv.id = psq.question_version_id
       JOIN public.questions q ON q.id = qv.question_id
       WHERE psq.session_id = $1
       ORDER BY psq.order_index ASC`,
      [sessionId]
    );

    const questionReviews: Array<{
      questionId: string;
      questionVersionId?: string;
      userAnswer: string;
      isCorrect: boolean;
      correctAnswer?: string | string[];
      explanation?: string | null;
      isSubjective?: boolean;
    }> = [];

    const SUBJECTIVE_TYPES = new Set(['WRITING_TASK_1', 'WRITING_TASK_2', 'SPEAKING']);

    if (sessionQuestionsRes.rows.length > 0) {
      for (const row of sessionQuestionsRes.rows) {
        const payload =
          typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload || {};
        const itemType = (payload.type || payload.itemType || '').toUpperCase();
        const isSubjective = SUBJECTIVE_TYPES.has(itemType);

        const candidateAns = answers[row.question_id] || answers[row.question_version_id];
        const userCode =
          candidateAns?.userAnswer ||
          candidateAns?.selectedOptionCode ||
          (typeof candidateAns === 'string' ? candidateAns : '');

        if (isSubjective) {
          questionReviews.push({
            questionId: row.question_id,
            questionVersionId: row.question_version_id,
            userAnswer: userCode || '',
            isCorrect: false,
            correctAnswer: undefined,
            explanation: row.explanation || null,
            isSubjective: true,
          });
        } else {
          const evalResult = await practiceRepo.evaluateObjectiveAnswer(
            row.question_version_id,
            userCode,
            itemType
          );
          if (evalResult.isCorrect) {
            correctCount++;
          }
          questionReviews.push({
            questionId: row.question_id,
            questionVersionId: row.question_version_id,
            userAnswer: userCode || '',
            isCorrect: evalResult.isCorrect,
            correctAnswer: evalResult.correctAnswer,
            explanation: evalResult.explanation || null,
            isSubjective: false,
          });
        }
      }
    } else {
      // Fallback: evaluate submitted answers directly
      for (const [qId, ans] of answerEntries) {
        const qAns = ans as any;
        const userCode =
          qAns.userAnswer || qAns.selectedOptionCode || (typeof qAns === 'string' ? qAns : '');
        const qVersionId = qAns.questionVersionId || qId;

        const evalResult = await practiceRepo.evaluateObjectiveAnswer(qVersionId, userCode);
        if (evalResult.isCorrect) {
          correctCount++;
        }
        questionReviews.push({
          questionId: qId,
          questionVersionId: qVersionId,
          userAnswer: userCode || '',
          isCorrect: evalResult.isCorrect,
          correctAnswer: evalResult.correctAnswer,
          explanation: evalResult.explanation || null,
          isSubjective: false,
        });
      }
    }

    const totalQuestions =
      sessionRecord.total_questions || sessionQuestionsRes.rows.length || answerEntries.length || 1;

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

    const tenantId = sessionRecord.tenant_id || session?.tenantId || req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        { error: 'DATA_INTEGRITY_ERROR', message: 'Missing tenant_id in practice session record' },
        { status: 422 }
      );
    }

    await pool.query(
      `INSERT INTO public.student_skill_profiles 
       (id, student_id, skill_code, mastery_percentage, computed_stage, tenant_id, assessment_session_id, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NULL, now())
       ON CONFLICT (student_id, skill_code) DO UPDATE SET
         mastery_percentage = EXCLUDED.mastery_percentage,
         computed_stage = EXCLUDED.computed_stage,
         tenant_id = EXCLUDED.tenant_id,
         updated_at = now()`,
      [
        studentId,
        sessionRecord.section_code || sessionRecord.skill_code || 'Reading',
        scorePercentage,
        computedStage,
        tenantId,
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
      questionReviews,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
