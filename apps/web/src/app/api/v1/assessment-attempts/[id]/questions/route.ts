export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

/**
 * GET /api/v1/assessment-attempts/:id/questions
 *
 * CRITICAL SECURITY & ACCREDITATION GUARD:
 * Server model (QuestionSnapshot) in paper_snapshot contains correctOptionCode.
 * Client DTO (QuestionResponse) MUST NEVER EXPOSE correctOptionCode or any answer keys.
 * This endpoint explicitly sanitizes all questions into Client DTOs before returning JSON.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID();

  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized', requestId }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch attempt record with student ownership check
    const attemptRes = await pool.query(
      `SELECT * FROM public.assessment_attempts WHERE id = $1 AND student_id = $2 AND (deleted_at IS NULL OR deleted_at IS NOT NULL)`,
      [attemptId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Attempt not found or unauthorized', requestId },
        { status: 404 }
      );
    }

    const attempt = attemptRes.rows[0];

    // 2. Fetch saved candidate answers
    const answersRes = await pool.query(
      `SELECT question_id, response_payload, time_spent_ms FROM public.assessment_attempt_answers WHERE attempt_id = $1`,
      [attemptId]
    );

    const savedAnswers: Record<string, any> = {};
    answersRes.rows.forEach((r) => {
      savedAnswers[r.question_id] = r.response_payload;
    });

    // 3. Read EXCLUSIVELY from frozen paper snapshot
    const paperSnapshot = typeof attempt.paper_snapshot === 'string'
      ? JSON.parse(attempt.paper_snapshot)
      : (attempt.paper_snapshot || {});

    // 4. Compute backend-owned server remaining time
    const startedAt = attempt.started_at || new Date();
    const durationMinutes = attempt.duration_minutes || paperSnapshot.durationMinutes || 45;
    const expiresAt = attempt.expires_at || new Date(new Date(startedAt).getTime() + durationMinutes * 60 * 1000);
    const remainingTime = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

    // 5. Append-only event log for question reading
    await pool.query(
      `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
       VALUES ($1, 'QUESTION_OPENED', $2, NOW())`,
      [attemptId, JSON.stringify({ remainingTime, requestId })]
    ).catch(() => null);

    // =======================================================================
    // 6. CLIENT DTO SANITIZATION — NEVER SERIALIZE correctOptionCode
    // =======================================================================

    // Sanitize Grammar Questions DTO
    const sanitizedGrammarQs = (paperSnapshot.grammarQuestions || []).map((q: any) => ({
      id: q.id,
      versionId: q.versionId,
      code: q.code,
      prompt: q.prompt,
      section: q.section || 'Grammar',
      itemType: q.itemType || 'MCQ',
      proficiencyLevel: q.proficiencyLevel || 'INTERMEDIATE',
      options: (q.options || []).map((o: any) => ({
        code: o.code,
        text: o.text,
      })),
      marks: q.marks || 1,
      order: q.order,
      // INTENTIONALLY OMITTED: correctOptionCode, isCorrect, answerKey
    }));

    // Sanitize Reading Passage & Comprehension Questions DTO
    let sanitizedReadingPassage = null;
    if (paperSnapshot.readingPassage) {
      const rp = paperSnapshot.readingPassage;
      sanitizedReadingPassage = {
        id: rp.id,
        code: rp.code,
        title: rp.title,
        content: rp.content,
        comprehensionQuestions: (rp.comprehensionQuestions || []).map((cq: any) => ({
          id: cq.id,
          versionId: cq.versionId,
          code: cq.code,
          prompt: cq.prompt,
          itemType: cq.itemType || 'MCQ',
          options: (cq.options || []).map((o: any) => ({
            code: o.code,
            text: o.text,
          })),
          marks: cq.marks || 1,
          // INTENTIONALLY OMITTED: correctOptionCode, isCorrect, answerKey
        })),
      };
    }

    // Sanitize Writing Tasks DTO
    const sanitizedWritingTasks = (paperSnapshot.writingTasks || []).map((w: any) => ({
      id: w.id,
      code: w.code,
      taskNumber: w.taskNumber,
      title: w.title,
      prompt: w.prompt,
      instructions: w.instructions,
      minWords: w.minWords,
      maxWords: w.maxWords,
      itemType: w.itemType || 'ESSAY',
      marks: w.marks || 10,
    }));

    const totalQuestions =
      sanitizedGrammarQs.length +
      (sanitizedReadingPassage?.comprehensionQuestions?.length || (sanitizedReadingPassage ? 1 : 0)) +
      sanitizedWritingTasks.length;

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        assessment: {
          id: attempt.catalog_id,
          title: paperSnapshot.assessment?.title || 'Placement Assessment',
          durationMinutes,
        },
        status: attempt.status,
        remainingTime,
        totalQuestions,
        grammarQuestions: sanitizedGrammarQs,
        readingPassage: sanitizedReadingPassage,
        writingTasks: sanitizedWritingTasks,
        savedAnswers,
        responseCount: answersRes.rows.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 1,
        requestId,
      },
    });
  } catch (err: any) {
    console.error(`[${requestId}] GET /api/v1/assessment-attempts/[id]/questions error:`, err);
    return NextResponse.json({ success: false, error: err.message, requestId }, { status: 500 });
  }
}
