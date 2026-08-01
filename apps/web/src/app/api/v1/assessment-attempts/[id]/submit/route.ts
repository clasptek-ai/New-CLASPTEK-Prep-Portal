export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

/**
 * POST /api/v1/assessment-attempts/:id/submit
 *
 * RC1 Production Hardening:
 * - Scoring reads correctOptionCode exclusively from paper_snapshot (never from editable tables)
 * - MCQ grammar questions: exact match against correctOptionCode
 * - Reading comprehension: exact match against correctOptionCode
 * - Writing tasks: deferred async evaluation (placeholder with extensible score slot)
 * - Section-level scores and weighted total computed and stored
 * - All writes wrapped in a single BEGIN/COMMIT transaction
 * - Duplicate submission rejected (attempt must be IN_PROGRESS)
 * - Placement recommendation derived from total weighted score
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID();

  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId ||
      (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized', requestId }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Fetch attempt — must be IN_PROGRESS and owned by this student
      const attemptRes = await client.query(
        `SELECT * FROM public.assessment_attempts
         WHERE id = $1 AND student_id = $2 AND status = 'IN_PROGRESS'
         FOR UPDATE`,
        [attemptId, studentId]
      );

      if (attemptRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Attempt not active, not found, or already submitted', requestId },
          { status: 404 }
        );
      }

      const attempt = attemptRes.rows[0];

      // 2. Deserialize frozen paper snapshot
      const paperSnapshot =
        typeof attempt.paper_snapshot === 'string'
          ? JSON.parse(attempt.paper_snapshot)
          : attempt.paper_snapshot || {};

      // 3. Fetch candidate answers
      const answersRes = await client.query(
        `SELECT question_id, response_payload, time_spent_ms
         FROM public.assessment_attempt_answers
         WHERE attempt_id = $1`,
        [attemptId]
      );

      const candidateAnswers = new Map<string, any>();
      answersRes.rows.forEach((r) => {
        candidateAnswers.set(r.question_id, r.response_payload);
      });

      // =======================================================================
      // 4. SCORING ENGINE — reads exclusively from paper_snapshot
      // =======================================================================

      // --- Grammar Section Scoring ---
      const grammarQs: any[] = paperSnapshot.grammarQuestions || [];
      let grammarCorrect = 0;
      let grammarTotal = 0;

      const grammarScoreMap: Record<string, { correct: boolean; selectedCode: string | null; correctCode: string }> = {};

      grammarQs.forEach((q: any) => {
        grammarTotal += q.marks || 1;
        const raw = candidateAnswers.get(q.id);
        const selectedCode =
          raw === null || raw === undefined
            ? null
            : typeof raw === 'string'
            ? raw
            : raw?.selectedOptionCode || raw?.code || raw?.answer || null;

        const isCorrect =
          selectedCode !== null && q.correctOptionCode && selectedCode === q.correctOptionCode;

        if (isCorrect) grammarCorrect += q.marks || 1;

        grammarScoreMap[q.id] = {
          correct: isCorrect,
          selectedCode,
          correctCode: q.correctOptionCode || '?',
        };
      });

      const grammarRaw = grammarTotal > 0 ? (grammarCorrect / grammarTotal) * 100 : 0;

      // --- Reading Section Scoring ---
      const readingPassage = paperSnapshot.readingPassage;
      const comprehensionQs: any[] = readingPassage?.comprehensionQuestions || [];
      let readingCorrect = 0;
      let readingTotal = 0;

      comprehensionQs.forEach((q: any) => {
        readingTotal += q.marks || 1;
        const raw = candidateAnswers.get(q.id);
        const selectedCode =
          raw === null || raw === undefined
            ? null
            : typeof raw === 'string'
            ? raw
            : raw?.selectedOptionCode || raw?.code || raw?.answer || null;

        const isCorrect =
          selectedCode !== null && q.correctOptionCode && selectedCode === q.correctOptionCode;

        if (isCorrect) readingCorrect += q.marks || 1;
      });

      const readingRaw = readingTotal > 0 ? (readingCorrect / readingTotal) * 100 : 0;

      // --- Writing Section Scoring ---
      // Writing is scored asynchronously (AI evaluation pipeline).
      // We store a placeholder score of 0 and mark writing as PENDING.
      // The evaluation worker will update assessment_attempt_answers.is_correct
      // and the placement will be re-computed once writing scores are available.
      const writingTasks: any[] = paperSnapshot.writingTasks || [];
      const writingPending = writingTasks.length > 0;
      const writingRaw = 0; // deferred — will be updated by AI evaluation pipeline

      // --- Weighted Total Score ---
      const scoringConfig = paperSnapshot.scoring || {
        grammarWeight: 0.6,
        readingWeight: 0.2,
        writingWeight: 0.2,
        placementThresholds: { ADVANCED: 80, INTERMEDIATE: 50, FOUNDATION: 0 },
      };

      const thresholds = scoringConfig.placementThresholds || { ADVANCED: 80, INTERMEDIATE: 50, FOUNDATION: 0 };

      // Adjust weights if writing is pending (redistribute to objective sections)
      let weightedScore: number;
      if (writingPending) {
        // Redistribute writing weight proportionally to grammar and reading
        const totalObjectiveWeight = scoringConfig.grammarWeight + scoringConfig.readingWeight;
        const grammarAdjusted = scoringConfig.grammarWeight / totalObjectiveWeight;
        const readingAdjusted = scoringConfig.readingWeight / totalObjectiveWeight;
        weightedScore = grammarRaw * grammarAdjusted + readingRaw * readingAdjusted;
      } else {
        weightedScore =
          grammarRaw * scoringConfig.grammarWeight +
          readingRaw * scoringConfig.readingWeight +
          writingRaw * scoringConfig.writingWeight;
      }

      const totalScore = Math.round(weightedScore * 100) / 100;

      // --- Placement Recommendation ---
      let computedLevel = 'FOUNDATION';
      if (totalScore >= thresholds.ADVANCED) computedLevel = 'ADVANCED';
      else if (totalScore >= thresholds.INTERMEDIATE) computedLevel = 'INTERMEDIATE';

      const scoreBreakdown = {
        grammar: {
          correct: grammarCorrect,
          total: grammarTotal,
          percentage: Math.round(grammarRaw * 100) / 100,
        },
        reading: {
          correct: readingCorrect,
          total: readingTotal,
          percentage: Math.round(readingRaw * 100) / 100,
        },
        writing: {
          status: writingPending ? 'PENDING_EVALUATION' : 'SKIPPED',
          score: writingRaw,
        },
        weighted: totalScore,
        placementLevel: computedLevel,
        writingPending,
      };

      // 5. Update assessment_attempt_answers.is_correct for MCQ/Reading items
      // (batch update for grade-book accuracy)
      for (const [qId, result] of Object.entries(grammarScoreMap)) {
        await client.query(
          `UPDATE public.assessment_attempt_answers
           SET is_correct = $1, updated_at = NOW()
           WHERE attempt_id = $2 AND question_id = $3`,
          [result.correct, attemptId, qId]
        );
      }

      // 6. Lock attempt as SUBMITTED and store score breakdown
      await client.query(
        `UPDATE public.assessment_attempts
         SET status = 'SUBMITTED',
             closed_at = NOW(),
             score = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [totalScore, attemptId]
      );

      // 7. Log SUBMITTED event with full scoring evidence
      await client.query(
        `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
         VALUES ($1, 'SUBMITTED', $2, NOW())`,
        [
          attemptId,
          JSON.stringify({
            requestId,
            scoreBreakdown,
            submittedAt: new Date().toISOString(),
          }),
        ]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: {
          attemptId,
          status: 'SUBMITTED',
          score: totalScore,
          computedLevel,
          scoreBreakdown,
          submittedAt: new Date().toISOString(),
        },
        meta: { timestamp: new Date().toISOString(), version: 1, requestId },
      });
    } catch (innerErr: any) {
      await client.query('ROLLBACK');
      console.error(`[${requestId}] POST /api/v1/assessment-attempts/${attemptId}/submit transaction error:`, innerErr);
      return NextResponse.json({ success: false, error: innerErr.message, requestId }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error(`[${requestId}] POST /api/v1/assessment-attempts/[id]/submit error:`, err);
    return NextResponse.json({ success: false, error: err.message, requestId }, { status: 500 });
  }
}
