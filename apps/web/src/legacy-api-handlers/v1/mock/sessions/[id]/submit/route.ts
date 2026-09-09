export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import {
  PostgresCanonicalMockRepository,
  PostgresSubjectiveEvaluationRepository,
} from '@clasptek/persistence';
import { ExamPluginRegistry } from '@/features/plugins/registry/exam-plugin.registry';

export const IELTS_SECTION_IDS = {
  LISTENING: '00000000-0000-0000-0001-000000000001',
  READING: '00000000-0000-0000-0001-000000000002',
  WRITING: '00000000-0000-0000-0001-000000000003',
  SPEAKING: '00000000-0000-0000-0001-000000000004',
};

function calculateIELTSListeningBand(rawCorrect: number): number {
  // Official IELTS Academic Listening Band Score conversion table
  if (rawCorrect >= 39) return 9.0;
  if (rawCorrect >= 37) return 8.5;
  if (rawCorrect >= 35) return 8.0;
  if (rawCorrect >= 32) return 7.5;
  if (rawCorrect >= 30) return 7.0;
  if (rawCorrect >= 27) return 6.5; // NOTE: 26 → 6.0 (not 6.5), per official IELTS conversion
  if (rawCorrect >= 23) return 6.0;
  if (rawCorrect >= 18) return 5.5;
  if (rawCorrect >= 16) return 5.0;
  if (rawCorrect >= 13) return 4.5;
  if (rawCorrect >= 10) return 4.0;
  if (rawCorrect >= 8) return 3.5;
  if (rawCorrect >= 6) return 3.0;
  if (rawCorrect >= 4) return 2.5;
  if (rawCorrect >= 2) return 2.0;
  return 1.0;
}

function calculateIELTSReadingBand(rawCorrect: number): number {
  // Official IELTS Academic Reading Band Score conversion table
  if (rawCorrect >= 39) return 9.0;
  if (rawCorrect >= 37) return 8.5;
  if (rawCorrect >= 35) return 8.0;
  if (rawCorrect >= 33) return 7.5;
  if (rawCorrect >= 30) return 7.0;
  if (rawCorrect >= 27) return 6.5;
  if (rawCorrect >= 23) return 6.0;
  if (rawCorrect >= 19) return 5.5;
  if (rawCorrect >= 15) return 5.0;
  if (rawCorrect >= 13) return 4.5;
  if (rawCorrect >= 10) return 4.0;
  if (rawCorrect >= 8) return 3.5;
  if (rawCorrect >= 6) return 3.0;
  if (rawCorrect >= 4) return 2.5;
  if (rawCorrect >= 2) return 2.0;
  return 1.0;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || req.headers.get('x-student-id') || req.headers.get('x-clasptek-user-id');

    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const rawAnswers = body.answers || {};

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();
    const mockRepo = new PostgresCanonicalMockRepository(pool);
    const subjectiveRepo = new PostgresSubjectiveEvaluationRepository(pool);

    const sessionRecord = await mockRepo.getSessionById(sessionId);
    if (!sessionRecord) {
      return NextResponse.json({ error: 'Mock session not found' }, { status: 404 });
    }

    // Verify session ownership
    if (
      sessionRecord.student_id !== studentId &&
      process.env.NODE_ENV !== 'development' &&
      process.env.NODE_ENV !== 'test'
    ) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    // Idempotency check: If already submitted, return current result
    if (sessionRecord.status === 'SUBMITTED' || sessionRecord.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        message: 'Mock session already submitted',
        sessionId,
        status: sessionRecord.status,
        officialScoreLabel: sessionRecord.official_score_label || 'Estimated Mock Score',
      });
    }

    // 1. Retrieve all question snapshots for this session to guarantee every presented question is tracked
    const snapshots = await mockRepo.getSessionQuestionSnapshots(sessionId);

    // Build unified list of questions
    const questionList: Array<{
      questionId: string;
      questionVersionId?: string;
      sectionName: string;
      itemType: string;
      prompt: string;
      taskType?: string;
      partNumber?: number;
    }> = [];

    if (snapshots.length > 0) {
      snapshots.forEach((s: any) => {
        const p = s.snapshotPayload || {};
        questionList.push({
          questionId: s.questionId,
          questionVersionId: s.questionVersionId,
          sectionName: p.sectionName || 'General',
          itemType: p.itemType || 'MCQ',
          prompt: p.prompt || '',
          taskType: p.speaking
            ? `PART_${p.speaking.partNumber || 1}`
            : p.sectionName === 'Writing'
              ? 'TASK_2'
              : undefined,
          partNumber: p.speaking?.partNumber,
        });
      });
    } else {
      // Fallback to answers dictionary if snapshots were not captured
      Object.entries(rawAnswers).forEach(([qId, ans]: [string, any]) => {
        questionList.push({
          questionId: qId,
          questionVersionId: ans.questionVersionId,
          sectionName:
            ans.sectionName ||
            (ans.itemType === 'ESSAY'
              ? 'Writing'
              : ans.itemType === 'SPEAKING_PROMPT'
                ? 'Speaking'
                : 'Reading'),
          itemType: ans.itemType || 'MCQ',
          prompt: ans.prompt || '',
        });
      });
    }

    // 2. Score objective items and map all answers
    let listeningCorrect = 0;
    let listeningTotal = 0;
    let readingCorrect = 0;
    let readingTotal = 0;

    const mappedAnswers: Array<{
      questionId: string;
      sectionId: string;
      studentAnswer: string | null;
      selectedOption: string | null;
      textResponse: string | null;
      timeSpentMs: number;
      isCorrect: boolean | null;
      isAnswered: boolean;
      state: 'ANSWERED' | 'SKIPPED' | 'UNANSWERED';
      extraPayload?: any;
    }> = [];

    const writingSubmissions: Array<{
      questionId: string;
      taskType: string;
      taskPrompt: string;
      text: string;
      wordCount: number;
    }> = [];

    const speakingSubmissions: Array<{
      questionId: string;
      partNumber: number;
      prompt: string;
      textOrUrl: string;
    }> = [];

    for (const q of questionList) {
      const userAnsObj = rawAnswers[q.questionId];
      let userVal: string | null = null;
      let timeSpent = 0;

      if (typeof userAnsObj === 'string') {
        userVal = userAnsObj.trim();
      } else if (userAnsObj && typeof userAnsObj === 'object') {
        userVal = (
          userAnsObj.studentAnswer ||
          userAnsObj.selectedOptionCode ||
          userAnsObj.text ||
          ''
        ).trim();
        timeSpent = (userAnsObj.timeSpentSeconds || 0) * 1000;
      }

      const isAnswered = Boolean(userVal && userVal.length > 0);
      const state: 'ANSWERED' | 'SKIPPED' | 'UNANSWERED' = isAnswered ? 'ANSWERED' : 'UNANSWERED';
      let isCorrect: boolean | null = null;

      const secNorm = (q.sectionName || '').toUpperCase();
      let targetSectionId = IELTS_SECTION_IDS.READING;

      if (secNorm.includes('LISTEN')) {
        targetSectionId = IELTS_SECTION_IDS.LISTENING;
        listeningTotal++;
        if (isAnswered) {
          // Pass itemType so evaluator uses the correct evaluation path
          isCorrect = await mockRepo.evaluateObjectiveAnswer(
            q.questionVersionId || q.questionId,
            userVal!,
            q.itemType
          );
          if (isCorrect) listeningCorrect++;
        } else {
          isCorrect = false;
        }
      } else if (secNorm.includes('READ')) {
        targetSectionId = IELTS_SECTION_IDS.READING;
        readingTotal++;
        if (isAnswered) {
          // Pass itemType so evaluator uses the correct evaluation path
          isCorrect = await mockRepo.evaluateObjectiveAnswer(
            q.questionVersionId || q.questionId,
            userVal!,
            q.itemType
          );
          if (isCorrect) readingCorrect++;
        } else {
          isCorrect = false;
        }
      } else if (
        secNorm.includes('WRITE') ||
        q.itemType === 'ESSAY' ||
        q.itemType === 'WRITING' ||
        q.itemType?.includes('WRITING')
      ) {
        targetSectionId = IELTS_SECTION_IDS.WRITING;
        isCorrect = null;
        if (isAnswered) {
          writingSubmissions.push({
            questionId: q.questionId,
            taskType: q.taskType || (writingSubmissions.length === 0 ? 'TASK_1' : 'TASK_2'),
            taskPrompt: q.prompt,
            text: userVal!,
            wordCount: userVal!.split(/\s+/).filter(Boolean).length,
          });
        }
      } else if (secNorm.includes('SPEAK') || q.itemType === 'SPEAKING_PROMPT') {
        targetSectionId = IELTS_SECTION_IDS.SPEAKING;
        isCorrect = null;
        if (isAnswered) {
          speakingSubmissions.push({
            questionId: q.questionId,
            partNumber: q.partNumber || speakingSubmissions.length + 1,
            prompt: q.prompt,
            textOrUrl: userVal!,
          });
        }
      }

      mappedAnswers.push({
        questionId: q.questionId,
        sectionId: targetSectionId,
        studentAnswer: userVal,
        selectedOption: isAnswered && userVal!.length <= 3 ? userVal : null,
        textResponse: isAnswered && userVal!.length > 3 ? userVal : null,
        timeSpentMs: timeSpent,
        isCorrect,
        isAnswered,
        state,
      });
    }

    // 3. Compute section scores
    const listeningBand = listeningTotal > 0 ? calculateIELTSListeningBand(listeningCorrect) : 0;
    const readingBand = readingTotal > 0 ? calculateIELTSReadingBand(readingCorrect) : 0;

    const sectionScores = [
      {
        sectionId: IELTS_SECTION_IDS.LISTENING,
        rawScore: listeningCorrect,
        scaledScore: listeningBand,
        maxScore: listeningTotal || 40,
        accuracyPct:
          listeningTotal > 0
            ? parseFloat(((listeningCorrect / listeningTotal) * 100).toFixed(2))
            : 0,
      },
      {
        sectionId: IELTS_SECTION_IDS.READING,
        rawScore: readingCorrect,
        scaledScore: readingBand,
        maxScore: readingTotal || 40,
        accuracyPct:
          readingTotal > 0 ? parseFloat(((readingCorrect / readingTotal) * 100).toFixed(2)) : 0,
      },
      {
        sectionId: IELTS_SECTION_IDS.WRITING,
        rawScore: 0,
        scaledScore: 0,
        maxScore: 9.0,
        accuracyPct: 0,
      },
      {
        sectionId: IELTS_SECTION_IDS.SPEAKING,
        rawScore: 0,
        scaledScore: 0,
        maxScore: 9.0,
        accuracyPct: 0,
      },
    ];

    // 4. Save attempt and all answers to PostgreSQL
    const attemptId = await mockRepo.saveMockAttemptAndAnswers({
      sessionId,
      studentId,
      answers: mappedAnswers,
      sectionScores,
    });

    const hasPendingSubjective = writingSubmissions.length > 0 || speakingSubmissions.length > 0;
    const totalObjectiveCorrect = listeningCorrect + readingCorrect;
    const totalObjectiveQuestions = listeningTotal + readingTotal || 80;
    const scorePercentage = parseFloat(
      ((totalObjectiveCorrect / totalObjectiveQuestions) * 100).toFixed(2)
    );

    const examType = sessionRecord.exam_type || 'IELTS Academic';
    const plugin = ExamPluginRegistry.getPlugin(examType);
    const conversion = plugin.calculateOverallScore(totalObjectiveCorrect, totalObjectiveQuestions);

    const evaluationState = hasPendingSubjective ? 'EVALUATING' : 'COMPLETED';
    const officialScoreLabel = hasPendingSubjective
      ? `Estimated Mock Score: ${conversion.bandOrScale} (Subjective Pending)`
      : `Estimated Mock Score: ${conversion.bandOrScale}`;

    const submittedAt = new Date();
    const scaledScore =
      typeof conversion.overallScore === 'number'
        ? conversion.overallScore
        : parseFloat(String(conversion.overallScore || 0));

    // Update canonical mock_sessions & mock_results in PostgreSQL
    await mockRepo.updateMockSessionResult(sessionId, {
      status: 'SUBMITTED',
      evaluationState,
      scorePercentage,
      officialScaledScore: scaledScore,
      officialScoreLabel,
      submittedAt,
    });

    // 5. Enqueue and trigger asynchronous AI subjective evaluations (Writing & Speaking)
    if (writingSubmissions.length > 0) {
      for (const w of writingSubmissions) {
        try {
          const evalJob = await subjectiveRepo.enqueueEvaluation({
            studentId,
            assessmentType: 'MOCK',
            sessionId,
            responseId: w.questionId,
            questionId: w.questionId,
            skill: 'Writing',
            rawResponseReference: w.text,
            examType,
            taskType: (w.taskType === 'TASK_1' ? 'TASK_1' : 'TASK_2') as 'TASK_1' | 'TASK_2',
            taskPrompt: w.taskPrompt,
          });

          // Run evaluation asynchronously via Google Gemini (zero fabricated score on failure)
          subjectiveRepo
            .evaluateSubjectiveJob(evalJob.id)
            .then(async (evalRes) => {
              console.info(
                `[MOCK_WRITING_EVAL_COMPLETE] sessionId=${sessionId} evalId=${evalJob.id} band=${evalRes.record.scoreLabel}`
              );
              await subjectiveRepo.recalculateSessionResults(sessionId, 'MOCK');
            })
            .catch((evalErr) => {
              console.error(
                `[MOCK_WRITING_EVAL_FAILED] sessionId=${sessionId} evalId=${evalJob.id} error="${evalErr.message}"`
              );
            });
        } catch (enqueueErr) {
          console.error(`[MOCK_WRITING_ENQUEUE_ERROR] sessionId=${sessionId}:`, enqueueErr);
        }
      }
    }

    if (speakingSubmissions.length > 0) {
      for (const spk of speakingSubmissions) {
        try {
          // Check for linked audio recording in speaking_recordings
          const spkRecLookup = await pool.query(
            `SELECT audio_url FROM public.speaking_recordings WHERE session_id = $1 AND question_id = $2 LIMIT 1`,
            [sessionId, spk.questionId]
          );
          const recordingUrl = spkRecLookup.rows[0]?.audio_url;

          const evalJob = await subjectiveRepo.enqueueEvaluation({
            studentId,
            assessmentType: 'MOCK',
            sessionId,
            responseId: spk.questionId,
            questionId: spk.questionId,
            skill: 'Speaking',
            rawResponseReference: recordingUrl || spk.textOrUrl,
            transcript: spk.textOrUrl.startsWith('/audio') ? undefined : spk.textOrUrl,
            examType,
            partNumber: spk.partNumber,
            questionPrompt: spk.prompt,
          });

          subjectiveRepo
            .evaluateSubjectiveJob(evalJob.id)
            .then(async (evalRes) => {
              console.info(
                `[MOCK_SPEAKING_EVAL_COMPLETE] sessionId=${sessionId} evalId=${evalJob.id} band=${evalRes.record.scoreLabel}`
              );
              await subjectiveRepo.recalculateSessionResults(sessionId, 'MOCK');
            })
            .catch((evalErr) => {
              console.error(
                `[MOCK_SPEAKING_EVAL_FAILED] sessionId=${sessionId} evalId=${evalJob.id} error="${evalErr.message}"`
              );
            });
        } catch (enqueueErr) {
          console.error(`[MOCK_SPEAKING_ENQUEUE_ERROR] sessionId=${sessionId}:`, enqueueErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      attemptId,
      status: 'SUBMITTED',
      evaluationState,
      scorePercentage,
      officialScaledScore: conversion.overallScore,
      officialScoreLabel,
      cefrLevel: conversion.cefrLevel,
      submittedAt,
      sectionScores: {
        listening: { raw: listeningCorrect, total: listeningTotal, band: listeningBand },
        reading: { raw: readingCorrect, total: readingTotal, band: readingBand },
        writing: { pending: writingSubmissions.length > 0 },
        speaking: { pending: speakingSubmissions.length > 0 },
      },
    });
  } catch (err: any) {
    console.error('POST /api/v1/mock/sessions/[id]/submit error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
