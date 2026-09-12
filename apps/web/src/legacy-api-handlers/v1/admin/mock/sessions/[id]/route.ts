export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

const SECTION_UUIDS = {
  LISTENING: '00000000-0000-0000-0001-000000000001',
  READING: '00000000-0000-0000-0001-000000000002',
  WRITING: '00000000-0000-0000-0001-000000000003',
  SPEAKING: '00000000-0000-0000-0001-000000000004',
};

/**
 * GET /api/v1/admin/mock/sessions/:id
 * Super Admin detail inspection endpoint for IELTS Mock Examination sessions.
 *
 * Enforces:
 * - Server-side RBAC (SUPER_ADMIN, ADMINISTRATOR, ADMIN, INSTRUCTOR, STAFF)
 * - Sanitized student details (no passwords, tokens, auth metadata)
 * - Full inspection of all 4 skills:
 *   1. Listening: 40 questions, candidate answers, answer keys, correctness, audio
 *   2. Reading: 40 questions, candidate answers, answer keys, correctness, passages
 *   3. Writing: Tasks 1 & 2, submitted essays, word counts, AI criteria evaluations & telemetry
 *   4. Speaking: Parts 1–3, prompts, transcripts, audio recordings, AI criteria evaluations & telemetry
 *   5. Section-level and overall IELTS bands
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);

    // Enforce Admin / Staff authorization
    const isStaff = session?.roles?.some((r) =>
      ['SUPER_ADMIN', 'ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Admin access required' },
        { status: 403 }
      );
    }

    const { id: sessionId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch Mock Session with sanitized student profile
    const sessionRes = await pool.query(
      `SELECT 
        ms.*,
        COALESCE(au.email, 'student@clasptek.ai') as student_email,
        COALESCE(NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''), au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1), 'Candidate') as student_name
       FROM public.mock_sessions ms
       LEFT JOIN auth.users au ON (au.id::text = ms.student_id::text)
       LEFT JOIN public.profiles p ON (p.user_id = ms.student_id OR p.id = ms.student_id)
       WHERE ms.id = $1`,
      [sessionId]
    );

    if (sessionRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mock examination session not found' },
        { status: 404 }
      );
    }

    const ms = sessionRes.rows[0];

    // 2. Fetch Blueprint details if available
    const bpRes = await pool.query(
      `SELECT id, exam_code, title, exam_type, version_no, rules_payload, sections_payload
       FROM public.mock_blueprints
       WHERE id = $1`,
      [ms.template_id]
    );
    const blueprint = bpRes.rows[0] || null;

    // 3. Fetch Question Snapshots (ordered by display_order ASC)
    const snapshotsRes = await pool.query(
      `SELECT id, question_id, question_version_id, passage_version_id, display_order, blueprint_version, snapshot_payload
       FROM public.session_question_snapshots
       WHERE session_id = $1
       ORDER BY display_order ASC`,
      [sessionId]
    );

    // 4. Fetch Candidate Attempt & Answers
    const attemptRes = await pool.query(
      `SELECT ma.id as attempt_id, ma.current_question_index, ma.answers_count,
              maa.id as answer_id, maa.question_id, maa.section_id, maa.answer_payload,
              maa.time_spent_ms, maa.is_correct, maa.created_at as answer_created_at
       FROM public.mock_attempts ma
       LEFT JOIN public.mock_attempt_answers maa ON maa.attempt_id = ma.id
       WHERE ma.session_id = $1`,
      [sessionId]
    );

    const answersMap: Record<string, any> = {};
    attemptRes.rows.forEach((r) => {
      if (r.question_id) {
        answersMap[r.question_id] = {
          answerId: r.answer_id,
          sectionId: r.section_id,
          responsePayload: r.answer_payload,
          isCorrect: r.is_correct,
          timeSpentMs: r.time_spent_ms,
          createdAt: r.answer_created_at,
        };
      }
    });

    // 5. Fetch Mock Section Scores
    const secScoresRes = await pool.query(
      `SELECT mss.* 
       FROM public.mock_section_scores mss
       JOIN public.mock_results mr ON mr.id = mss.result_id
       WHERE mr.session_id = $1`,
      [sessionId]
    );

    const sectionScoresMap: Record<string, any> = {};
    secScoresRes.rows.forEach((row) => {
      sectionScoresMap[row.section_id] = {
        id: row.id,
        sectionId: row.section_id,
        rawScore: parseFloat(row.raw_score || 0),
        scaledScore: parseFloat(row.scaled_score || 0),
        maxScore: parseFloat(row.max_score || 0),
        accuracyPct: parseFloat(row.accuracy_pct || 0),
      };
    });

    // 6. Fetch Subjective Evaluations (Writing & Speaking) with criteria
    const subjRes = await pool.query(
      `SELECT se.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'criterionName', sec.criterion_name,
                    'score', sec.score,
                    'maxScore', sec.max_score,
                    'feedback', sec.feedback
                  )
                ) FILTER (WHERE sec.id IS NOT NULL),
                '[]'::json
              ) as criteria
       FROM public.subjective_evaluations se
       LEFT JOIN public.subjective_evaluation_criteria sec ON sec.evaluation_id = se.id
       WHERE se.session_id = $1
       GROUP BY se.id
       ORDER BY se.created_at ASC`,
      [sessionId]
    );

    // 7. Fetch Speaking Audio Recordings
    const spkRecRes = await pool.query(
      `SELECT * FROM public.speaking_recordings 
       WHERE session_id = $1 
       ORDER BY part_number ASC, created_at ASC`,
      [sessionId]
    );
    const recordingsByPart: Record<number, any> = {};
    const recordingsByQuestion: Record<string, any> = {};
    spkRecRes.rows.forEach((rec) => {
      if (rec.part_number) recordingsByPart[rec.part_number] = rec;
      if (rec.question_id) recordingsByQuestion[rec.question_id] = rec;
    });

    // 8. Fetch Mock Result
    const mrRes = await pool.query(
      `SELECT * FROM public.mock_results WHERE session_id = $1 ORDER BY scored_at DESC LIMIT 1`,
      [sessionId]
    );
    const mockResult = mrRes.rows[0] || null;

    // 9. Separate and format Question Snapshots by Skill
    const listeningQuestions: any[] = [];
    const readingQuestions: any[] = [];
    const writingQuestions: any[] = [];
    const speakingQuestions: any[] = [];
    const readingPassagesMap: Record<string, any> = {};

    snapshotsRes.rows.forEach((row, idx) => {
      const payload = row.snapshot_payload || {};
      const qId = row.question_id || payload.questionId;
      const ansObj = answersMap[qId];

      const formattedItem = {
        questionId: qId,
        questionVersionId: row.question_version_id || payload.questionVersionId,
        displayOrder: row.display_order || idx + 1,
        code: payload.code || `Q-${idx + 1}`,
        prompt: payload.prompt || '',
        itemType: payload.itemType || 'MCQ',
        difficulty: payload.difficulty || 'MEDIUM',
        sectionName: payload.sectionName || 'Listening',
        options: payload.options || [],
        // For MCQ/MATCHING: look for the correct option code.
        // For SHORT_ANSWER/COMPLETION/etc.: surface correctAnswer text directly.
        // NEVER fall back to 'A' — that would mislead admin reviewers.
        correctOptionCode:
          payload.options?.find((o: any) => o.isCorrect)?.code || payload.correctOptionCode || null,
        correctAnswer: payload.correctAnswer || payload.acceptedAnswers?.[0] || null,
        acceptedAnswers: payload.acceptedAnswers || [],
        audio: payload.audio || null,
        passage: payload.passage || null,
        group: payload.group || null,
        speaking: payload.speaking || null,
        candidateAnswer:
          ansObj?.responsePayload?.studentAnswer ??
          ansObj?.responsePayload?.selectedOption ??
          ansObj?.responsePayload?.textResponse ??
          ansObj?.responsePayload ??
          null,
        isAnswered: ansObj?.responsePayload?.isAnswered ?? ansObj !== undefined,
        isCorrect: ansObj?.isCorrect ?? null,
        timeSpentMs: ansObj?.timeSpentMs ?? 0,
      };

      const secName = (payload.sectionName || '').toLowerCase();
      if (secName.includes('listen') || payload.audio) {
        listeningQuestions.push(formattedItem);
      } else if (secName.includes('read') || payload.passage) {
        readingQuestions.push(formattedItem);
        if (payload.passage?.id) {
          readingPassagesMap[payload.passage.id] = payload.passage;
        }
      } else if (secName.includes('write') || payload.itemType === 'ESSAY') {
        writingQuestions.push(formattedItem);
      } else if (secName.includes('speak') || payload.speaking) {
        speakingQuestions.push(formattedItem);
      } else {
        // Default to listening if first 40, reading if next 40
        if (listeningQuestions.length < 40) listeningQuestions.push(formattedItem);
        else if (readingQuestions.length < 40) readingQuestions.push(formattedItem);
        else writingQuestions.push(formattedItem);
      }
    });

    // 10. Format Writing Tasks with AI Evaluations
    const writingTasks = (
      writingQuestions.length > 0
        ? writingQuestions
        : [
            { prompt: 'Task 1: Academic Report', itemType: 'ESSAY' },
            { prompt: 'Task 2: Discursive Essay', itemType: 'ESSAY' },
          ]
    ).map((wq, idx) => {
      const taskNumber = idx + 1;
      const matchingEval =
        subjRes.rows.find(
          (s: any) =>
            s.skill === 'Writing' &&
            (s.question_id === wq.questionId ||
              s.metadata?.taskType === `TASK_${taskNumber}` ||
              s.response_id === `writing-task-${taskNumber}`)
        ) || subjRes.rows.filter((s: any) => s.skill === 'Writing')[idx];

      const ansObj = answersMap[wq.questionId];
      const submittedEssay =
        matchingEval?.raw_response_reference ||
        ansObj?.responsePayload?.textResponse ||
        ansObj?.responsePayload?.studentAnswer ||
        (typeof ansObj?.responsePayload === 'string' ? ansObj.responsePayload : '');

      const wordCount = submittedEssay.trim()
        ? submittedEssay.trim().split(/\s+/).filter(Boolean).length
        : 0;

      return {
        id: wq.questionId || `writing-task-${taskNumber}`,
        taskNumber,
        title: taskNumber === 1 ? 'Task 1: Academic Report' : 'Task 2: Discursive Essay',
        prompt:
          wq.prompt ||
          matchingEval?.metadata?.taskPrompt ||
          (taskNumber === 1 ? 'IELTS Academic Writing Task 1' : 'IELTS Academic Writing Task 2'),
        minWords: taskNumber === 1 ? 150 : 250,
        studentEssay: submittedEssay,
        wordCount,
        aiEvaluation: matchingEval
          ? {
              evaluationId: matchingEval.id,
              status: matchingEval.status,
              overallScore: matchingEval.overall_score
                ? parseFloat(matchingEval.overall_score)
                : null,
              scoreLabel: matchingEval.score_label || null,
              feedback: matchingEval.feedback || null,
              gradingProvider: matchingEval.metadata?.grading_provider || 'gemini',
              gradingModel: matchingEval.metadata?.grading_model || 'gemini-2.5-flash',
              isFallback: Boolean(matchingEval.metadata?.is_fallback),
              fallbackFrom: matchingEval.metadata?.fallback_from || null,
              criteria: matchingEval.criteria || [],
              completedAt: matchingEval.completed_at,
              failedAt: matchingEval.failed_at,
            }
          : null,
      };
    });

    // 11. Format Speaking Parts with Recordings & AI Evaluations
    const speakingParts = (
      speakingQuestions.length > 0
        ? speakingQuestions
        : [
            { prompt: 'Part 1: Introduction & General Questions' },
            { prompt: 'Part 2: Individual Long Turn' },
            { prompt: 'Part 3: Two-way In-depth Discussion' },
          ]
    ).map((sq, idx) => {
      const partNumber = idx + 1;
      const rec = recordingsByPart[partNumber] || recordingsByQuestion[sq.questionId];
      const matchingEval =
        subjRes.rows.find(
          (s: any) =>
            s.skill === 'Speaking' &&
            (s.question_id === sq.questionId ||
              s.metadata?.partNumber === partNumber ||
              s.response_id === `speaking-part-${partNumber}`)
        ) || subjRes.rows.filter((s: any) => s.skill === 'Speaking')[idx];

      const ansObj = answersMap[sq.questionId];
      const transcript =
        matchingEval?.transcript ||
        matchingEval?.raw_response_reference ||
        ansObj?.responsePayload?.transcript ||
        ansObj?.responsePayload?.textResponse ||
        '';

      return {
        id: sq.questionId || `speaking-part-${partNumber}`,
        partNumber,
        prompt:
          sq.prompt ||
          (partNumber === 1
            ? 'Part 1: Introduction'
            : partNumber === 2
              ? 'Part 2: Long Turn'
              : 'Part 3: Discussion'),
        transcript,
        audioUrl: rec?.audio_url || null,
        durationSeconds: rec?.duration_seconds || 0,
        aiEvaluation: matchingEval
          ? {
              evaluationId: matchingEval.id,
              status: matchingEval.status,
              overallScore: matchingEval.overall_score
                ? parseFloat(matchingEval.overall_score)
                : null,
              scoreLabel: matchingEval.score_label || null,
              feedback: matchingEval.feedback || null,
              gradingProvider: matchingEval.metadata?.grading_provider || 'gemini',
              gradingModel: matchingEval.metadata?.grading_model || 'gemini-2.5-flash',
              isFallback: Boolean(matchingEval.metadata?.is_fallback),
              fallbackFrom: matchingEval.metadata?.fallback_from || null,
              criteria: matchingEval.criteria || [],
              completedAt: matchingEval.completed_at,
              failedAt: matchingEval.failed_at,
            }
          : null,
      };
    });

    // Section scores
    const listeningScore = sectionScoresMap[SECTION_UUIDS.LISTENING] || {
      rawScore: listeningQuestions.filter((q) => q.isCorrect).length,
      scaledScore: 0,
      maxScore: 40,
      accuracyPct: 0,
    };
    const readingScore = sectionScoresMap[SECTION_UUIDS.READING] || {
      rawScore: readingQuestions.filter((q) => q.isCorrect).length,
      scaledScore: 0,
      maxScore: 40,
      accuracyPct: 0,
    };
    const writingScore = sectionScoresMap[SECTION_UUIDS.WRITING] || {
      rawScore: writingTasks[0]?.aiEvaluation?.overallScore || 0,
      scaledScore: writingTasks[0]?.aiEvaluation?.overallScore || 0,
      maxScore: 9.0,
      accuracyPct: 0,
    };
    const speakingScore = sectionScoresMap[SECTION_UUIDS.SPEAKING] || {
      rawScore: speakingParts[0]?.aiEvaluation?.overallScore || 0,
      scaledScore: speakingParts[0]?.aiEvaluation?.overallScore || 0,
      maxScore: 9.0,
      accuracyPct: 0,
    };

    const overallBand = mockResult?.official_scaled_score
      ? parseFloat(mockResult.official_scaled_score)
      : ms.official_scaled_score
        ? parseFloat(ms.official_scaled_score)
        : 0;

    // Assemble Audit Timeline
    const auditTimeline = [
      {
        id: `start-${ms.id}`,
        eventType: 'MOCK_STARTED',
        payload: { examType: ms.exam_type, startedAt: ms.started_at },
        timestamp: ms.started_at,
      },
      ...(ms.submitted_at
        ? [
            {
              id: `submit-${ms.id}`,
              eventType: 'MOCK_SUBMITTED',
              payload: {
                scorePercentage: ms.score_percentage,
                officialScoreLabel: ms.official_score_label,
                evaluationState: ms.evaluation_state,
              },
              timestamp: ms.submitted_at,
            },
          ]
        : []),
      ...subjRes.rows.map((s: any) => ({
        id: `eval-${s.id}`,
        eventType: `AI_EVALUATION_${s.status}`,
        payload: {
          skill: s.skill,
          score: s.overall_score,
          provider: s.metadata?.grading_provider,
          model: s.metadata?.grading_model,
          isFallback: s.metadata?.is_fallback,
        },
        timestamp: s.completed_at || s.failed_at || s.created_at,
      })),
    ];

    // Build response conforming to AttemptDetailBundle
    const detailResponse = {
      attempt: {
        id: ms.id,
        studentId: ms.student_id,
        studentName: ms.student_name,
        studentEmail: ms.student_email,
        candidateNumber: `CGA-${ms.student_id.slice(0, 8).toUpperCase()}`,
        status: ms.status,
        evaluationState: ms.evaluation_state,
        score: parseFloat(ms.score_percentage || 0),
        officialScaledScore: overallBand,
        officialScoreLabel:
          ms.official_score_label ||
          (overallBand ? `Band ${overallBand.toFixed(1)}` : 'Pending Evaluation'),
        durationMinutes: ms.time_remaining_seconds
          ? Math.round((9900 - ms.time_remaining_seconds) / 60)
          : 165,
        startedAt: ms.started_at,
        submittedAt: ms.submitted_at,
        expiresAt: ms.expires_at,
      },
      blueprint: blueprint
        ? {
            id: blueprint.id,
            examCode: blueprint.exam_code,
            title: blueprint.title,
            examType: blueprint.exam_type,
            versionNo: blueprint.version_no,
          }
        : null,
      sections: {
        listening: {
          score: listeningScore,
          questions: listeningQuestions,
        },
        reading: {
          score: readingScore,
          questions: readingQuestions,
          passages: Object.values(readingPassagesMap),
        },
        writing: {
          score: writingScore,
          tasks: writingTasks,
        },
        speaking: {
          score: speakingScore,
          parts: speakingParts,
        },
      },
      result: {
        overallScore: overallBand,
        cefrLevel:
          mockResult?.cefr_level || (overallBand >= 7.5 ? 'C1' : overallBand >= 5.5 ? 'B2' : 'B1'),
        predictedBand:
          ms.official_score_label ||
          (overallBand ? `Band ${overallBand.toFixed(1)}` : 'Pending Evaluation'),
        placementLevel: 'OFFICIAL_MOCK_EXAMINATION',
        recommendedCourse: 'IELTS Academic Masterclass',
        recommendedDuration: '8 Weeks',
        sectionScores: [
          {
            sectionCode: 'Listening',
            sectionName: 'Listening Comprehension',
            scorePercentage: listeningScore.accuracyPct,
            rawScore: listeningScore.rawScore,
            scaledScore: listeningScore.scaledScore,
          },
          {
            sectionCode: 'Reading',
            sectionName: 'Academic Reading',
            scorePercentage: readingScore.accuracyPct,
            rawScore: readingScore.rawScore,
            scaledScore: readingScore.scaledScore,
          },
          {
            sectionCode: 'Writing',
            sectionName: 'Academic Writing',
            scorePercentage: writingScore.scaledScore * 10,
            scaledScore: writingScore.scaledScore,
            evaluationState: writingTasks[0]?.aiEvaluation?.status || 'PENDING',
          },
          {
            sectionCode: 'Speaking',
            sectionName: 'Oral Interview & Discussion',
            scorePercentage: speakingScore.scaledScore * 10,
            scaledScore: speakingScore.scaledScore,
            evaluationState: speakingParts[0]?.aiEvaluation?.status || 'PENDING',
          },
        ],
        strengths: [
          ...(listeningScore.scaledScore >= 6.5 ? ['High Listening Accuracy'] : []),
          ...(readingScore.scaledScore >= 6.5 ? ['Strong Academic Reading Comprehension'] : []),
          'Official Test Protocol Adherence',
        ],
        weaknesses: [
          ...(listeningScore.scaledScore < 6.0 ? ['Listening Section Consistency'] : []),
          ...(readingScore.scaledScore < 6.0 ? ['Reading Passage Time Management'] : []),
        ],
        aiFeedback: {
          summary: ms.official_score_label
            ? `Official IELTS Mock Examination completed with ${ms.official_score_label}.`
            : 'Mock examination session recorded. Evaluation completed.',
          nextSteps: 'Review criterion-level diagnostic feedback across Writing and Speaking.',
        },
      },
      answers: answersMap,
      paperSnapshot: {
        snapshotVersion: 1,
        assessment: {
          id: ms.template_id,
          code: ms.exam_type || 'IELTS-MOCK',
          title: `${ms.exam_type || 'IELTS Academic'} Official Mock Examination`,
          durationMinutes: 165,
        },
        grammarQuestions: listeningQuestions.map((lq) => ({
          id: lq.questionId,
          prompt: lq.prompt,
          itemType: lq.itemType,
          correctOptionCode: lq.correctOptionCode,
          options: lq.options,
          audio: lq.audio,
        })),
        listeningQuestions,
        readingPassage: {
          title: Object.values(readingPassagesMap)[0]?.title || 'IELTS Academic Reading',
          content:
            Object.values(readingPassagesMap)[0]?.content ||
            'Passages loaded from session question snapshots.',
          comprehensionQuestions: readingQuestions.map((rq) => ({
            id: rq.questionId,
            prompt: rq.prompt,
            itemType: rq.itemType,
            correctOptionCode: rq.correctOptionCode,
            acceptedAnswers: rq.acceptedAnswers,
            options: rq.options,
          })),
        },
        readingPassages: Object.values(readingPassagesMap),
        writingTasks,
        speakingItems: speakingParts.map((sp) => ({
          id: sp.id,
          partNumber: sp.partNumber,
          prompt: sp.prompt,
          transcript: sp.transcript,
          audioUrl: sp.audioUrl,
          durationSeconds: sp.durationSeconds,
          aiEvaluation: sp.aiEvaluation,
        })),
      },
      auditTimeline,
    };

    return NextResponse.json({
      success: true,
      data: detailResponse,
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/mock/sessions/[id] error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
