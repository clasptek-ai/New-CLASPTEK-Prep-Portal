export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export interface ReconstructedQuestion {
  id: string;
  order: number;
  code: string;
  section: string;
  itemType: string;
  difficulty?: string;
  prompt: string;
  options: Array<{ code: string; text: string; isCorrect?: boolean }>;
  studentAnswer: any;
  correctAnswer: any;
  status: 'CORRECT' | 'INCORRECT' | 'UNANSWERED' | 'NOT_SCORED' | 'PENDING_REVIEW';
  isCorrect: boolean | null;
  explanation: string | null;
  timeSpentMs: number;
  subQuestions?: any[];
}

/**
 * Normalizes audio URLs so relative URLs like 'audio/section-1.mpeg' are correctly
 * prefixed with leading slash for browser playback.
 */
function normalizeAudioUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * Normalizes image stimulus URLs so relative paths like 'images/stimuli/rough-diamond-process.png'
 * are correctly prefixed with leading slash for browser rendering.
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * Extracts student's submitted answer from candidate answer record or payload.
 */
function extractStudentAnswer(ansObj: any): any {
  if (!ansObj) return null;
  const p = ansObj.responsePayload ?? ansObj.answer_payload;
  if (p === undefined || p === null) return null;
  if (typeof p === 'object') {
    if (p.studentAnswer !== undefined) return p.studentAnswer;
    if (p.selectedOption !== undefined) return p.selectedOption;
    if (p.textResponse !== undefined) return p.textResponse;
    if (p.value !== undefined) return p.value;
    if (p.answer !== undefined) return p.answer;
    return p;
  }
  return p;
}

/**
 * Determines question status (CORRECT, INCORRECT, UNANSWERED, NOT_SCORED)
 */
function determineQuestionStatus(
  isCorrect: boolean | null | undefined,
  candidateAnswer: any,
  itemType?: string
): 'CORRECT' | 'INCORRECT' | 'UNANSWERED' | 'NOT_SCORED' | 'PENDING_REVIEW' {
  if (
    itemType &&
    ['WRITING_TASK_1', 'WRITING_TASK_2', 'ESSAY', 'SPEAKING_PROMPT'].includes(itemType)
  ) {
    return candidateAnswer ? 'PENDING_REVIEW' : 'UNANSWERED';
  }
  if (candidateAnswer === null || candidateAnswer === undefined || candidateAnswer === '') {
    return 'UNANSWERED';
  }
  if (isCorrect === true) return 'CORRECT';
  if (isCorrect === false) return 'INCORRECT';
  return 'NOT_SCORED';
}

/**
 * GET /api/v1/admin/assessment-attempts/:id
 * Detailed Frozen Paper Snapshot & Multi-Attempt Response Reconstruction Endpoint.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);

    // Verify Admin or Staff role
    const isStaff = session?.roles?.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF', 'SUPER_ADMIN'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const url = new URL(req.url);
    const filterStudentId = url.searchParams.get('studentId')?.trim();

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Check Diagnostic Assessment Attempts (public.assessment_attempts)
    // ──────────────────────────────────────────────────────────────────────────
    const attemptRes = await pool.query(
      `SELECT 
        aa.*, 
        au.email as student_email, 
        COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as student_name,
        (SELECT COUNT(*) FROM public.assessment_attempts a2 
         WHERE a2.student_id = aa.student_id 
           AND a2.catalog_id = aa.catalog_id 
           AND a2.started_at <= aa.started_at) as attempt_number,
        (SELECT COUNT(*) FROM public.assessment_attempts a3 
         WHERE a3.student_id = aa.student_id 
           AND a3.catalog_id = aa.catalog_id) as total_attempts,
        ad.title as definition_title
       FROM public.assessment_attempts aa
       LEFT JOIN auth.users au ON (au.id::text = aa.student_id::text)
       LEFT JOIN public.profiles p ON (p.user_id = aa.student_id OR p.id = aa.student_id)
       LEFT JOIN public.assessment_definitions ad ON (ad.id = aa.catalog_id)
       WHERE aa.id = $1`,
      [attemptId]
    );

    if (attemptRes.rows.length > 0) {
      const attempt = attemptRes.rows[0];

      if (filterStudentId) {
        const studentMatch = await pool.query(
          `SELECT 1 FROM auth.users au 
           LEFT JOIN public.profiles p ON (p.user_id = au.id OR p.id = au.id)
           WHERE (au.id::text = $1 OR au.email ILIKE $1 OR p.id::text = $1 OR p.user_id::text = $1)
             AND (au.id::text = $2 OR p.id::text = $2 OR p.user_id::text = $2)`,
          [filterStudentId, attempt.student_id]
        );
        if (studentMatch.rows.length === 0 && attempt.student_id !== filterStudentId) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: Attempt does not belong to requested student' },
            { status: 403 }
          );
        }
      }

      // Fetch Stored Assessment Result
      const resultRes = await pool.query(
        `SELECT * FROM public.assessment_results WHERE attempt_id = $1`,
        [attemptId]
      );
      const result = resultRes.rows[0] || null;

      // Fetch Candidate Answers
      const answersRes = await pool.query(
        `SELECT question_id, response_payload, is_correct, time_spent_ms, updated_at
         FROM public.assessment_attempt_answers
         WHERE attempt_id = $1`,
        [attemptId]
      );

      const answersMap: Record<string, any> = {};
      answersRes.rows.forEach((r) => {
        answersMap[r.question_id] = {
          responsePayload: r.response_payload,
          isCorrect: r.is_correct,
          timeSpentMs: r.time_spent_ms,
          updatedAt: r.updated_at,
        };
      });

      // Fetch Event Audit Log Timeline
      const eventsRes = await pool.query(
        `SELECT id, event_type, event_payload, created_at
         FROM public.assessment_attempt_events
         WHERE attempt_id = $1
         ORDER BY created_at ASC`,
        [attemptId]
      );

      const auditTimeline = eventsRes.rows.map((e) => ({
        id: e.id,
        eventType: e.event_type,
        payload:
          typeof e.event_payload === 'string' ? JSON.parse(e.event_payload) : e.event_payload,
        timestamp: e.created_at,
      }));

      // Log ADMIN_REVIEWED event asynchronously
      pool
        .query(
          `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
         VALUES ($1, 'ADMIN_REVIEWED', $2, NOW())`,
          [
            attemptId,
            JSON.stringify({
              reviewedAt: new Date().toISOString(),
              adminId: session?.userId || 'system-admin',
            }),
          ]
        )
        .catch(() => null);

      const paperSnapshot =
        typeof attempt.paper_snapshot === 'string'
          ? JSON.parse(attempt.paper_snapshot)
          : attempt.paper_snapshot || {};

      // ─── RECONSTRUCT DIAGNOSTIC SECTIONS ──────────────────────────────────
      const grammarRaw = paperSnapshot.grammarQuestions || [];
      const grammarQuestions: ReconstructedQuestion[] = grammarRaw.map((q: any, idx: number) => {
        const ansObj = answersMap[q.id];
        const studentAns = extractStudentAnswer(ansObj);
        const correctAns = q.correctOptionCode || q.correctAnswer || null;
        const isCorrect =
          ansObj?.isCorrect ??
          (studentAns && correctAns
            ? String(studentAns).trim().toUpperCase() === String(correctAns).trim().toUpperCase()
            : null);
        const status = determineQuestionStatus(isCorrect, studentAns, q.itemType || 'MCQ');

        return {
          id: q.id || `grm-${idx + 1}`,
          order: q.order || idx + 1,
          code: q.code || `GRM-${idx + 1}`,
          section: 'Grammar',
          itemType: q.itemType || 'MCQ',
          difficulty: q.proficiencyLevel || 'FOUNDATION',
          prompt: q.prompt || '',
          options: (q.options || []).map((o: any) => ({
            code: o.code,
            text: o.text,
            isCorrect: o.code === correctAns,
          })),
          studentAnswer: studentAns,
          correctAnswer: correctAns,
          status,
          isCorrect,
          explanation: q.explanation || null,
          timeSpentMs: ansObj?.timeSpentMs || 0,
        };
      });

      // Diagnostic Reading
      let readingPassages: any[] = [];
      if (paperSnapshot.readingPassage) {
        const rp = paperSnapshot.readingPassage;
        const compQuestions: ReconstructedQuestion[] = (rp.comprehensionQuestions || []).map(
          (q: any, idx: number) => {
            const ansObj = answersMap[q.id];
            const studentAns = extractStudentAnswer(ansObj);
            const correctAns = q.correctOptionCode || q.correctAnswer || null;
            const isCorrect =
              ansObj?.isCorrect ??
              (studentAns && correctAns
                ? String(studentAns).trim().toUpperCase() ===
                  String(correctAns).trim().toUpperCase()
                : null);
            const status = determineQuestionStatus(isCorrect, studentAns, q.itemType || 'MCQ');

            return {
              id: q.id || `read-${idx + 1}`,
              order: q.order || idx + 1,
              code: q.code || `READ-${idx + 1}`,
              section: 'Reading',
              itemType: q.itemType || 'MCQ',
              difficulty: q.difficulty || 'FOUNDATION',
              prompt: q.prompt || '',
              options: (q.options || []).map((o: any) => ({
                code: o.code,
                text: o.text,
                isCorrect: o.code === correctAns,
              })),
              studentAnswer: studentAns,
              correctAnswer: correctAns,
              status,
              isCorrect,
              explanation: q.explanation || null,
              timeSpentMs: ansObj?.timeSpentMs || 0,
            };
          }
        );

        readingPassages = [
          {
            passageNumber: 1,
            title: rp.title || 'Diagnostic Reading Passage',
            content: rp.content || '',
            wordCount: rp.content ? rp.content.trim().split(/\s+/).length : 0,
            questions: compQuestions,
          },
        ];
      }

      // Diagnostic Listening (if present)
      let listeningSections: any[] = [];
      if (paperSnapshot.listeningQuestions && paperSnapshot.listeningQuestions.length > 0) {
        const lqList: ReconstructedQuestion[] = paperSnapshot.listeningQuestions.map(
          (q: any, idx: number) => {
            const ansObj = answersMap[q.id];
            const studentAns = extractStudentAnswer(ansObj);
            const correctAns = q.correctOptionCode || q.correctAnswer || null;
            const isCorrect =
              ansObj?.isCorrect ??
              (studentAns && correctAns
                ? String(studentAns).trim().toUpperCase() ===
                  String(correctAns).trim().toUpperCase()
                : null);
            const status = determineQuestionStatus(isCorrect, studentAns, q.itemType || 'MCQ');

            return {
              id: q.id || `list-${idx + 1}`,
              order: q.order || idx + 1,
              code: q.code || `LIST-${idx + 1}`,
              section: 'Listening',
              itemType: q.itemType || 'MCQ',
              prompt: q.prompt || '',
              options: (q.options || []).map((o: any) => ({
                code: o.code,
                text: o.text,
                isCorrect: o.code === correctAns,
              })),
              studentAnswer: studentAns,
              correctAnswer: correctAns,
              status,
              isCorrect,
              explanation: q.explanation || null,
              timeSpentMs: ansObj?.timeSpentMs || 0,
            };
          }
        );

        listeningSections = [
          {
            sectionNumber: 1,
            title: 'Diagnostic Listening Track',
            audioUrl: normalizeAudioUrl(
              paperSnapshot.listeningTrack?.url ||
                'https://cdn.clasptek.com/audio/eng-prof-diagnostic-track-1.mp3'
            ),
            transcript: paperSnapshot.listeningTrack?.transcript || null,
            durationSeconds: paperSnapshot.listeningTrack?.durationSeconds || 180,
            questions: lqList,
          },
        ];
      }

      // Diagnostic Writing (if present)
      const writingTasks = (paperSnapshot.writingTasks || []).map((wt: any, idx: number) => {
        const ansObj = answersMap[wt.id];
        const submitted = extractStudentAnswer(ansObj) || '';
        return {
          taskNumber: idx + 1,
          title: wt.title || `Writing Task ${idx + 1}`,
          prompt: wt.prompt || '',
          instructions:
            wt.instructions || 'Complete the response following the prompt instructions.',
          stimulusImageUrl: normalizeImageUrl(wt.imageUrl || wt.stimulusUrl),
          minWords: wt.minWords || (idx === 0 ? 150 : 250),
          studentEssay: typeof submitted === 'string' ? submitted : JSON.stringify(submitted),
          wordCount:
            typeof submitted === 'string' && submitted.trim()
              ? submitted.trim().split(/\s+/).length
              : 0,
          evaluationState: submitted ? 'EVALUATED' : 'NOT_SUBMITTED',
          overallScore: null,
          scoreLabel: null,
          feedback: null,
          criteria: [],
          rubrics: [],
        };
      });

      // Compute overview counts
      const allQuestions = [
        ...grammarQuestions,
        ...(readingPassages[0]?.questions || []),
        ...(listeningSections[0]?.questions || []),
      ];
      const answeredCount = allQuestions.filter((q) => q.status !== 'UNANSWERED').length;
      const correctCount = allQuestions.filter((q) => q.status === 'CORRECT').length;
      const incorrectCount = allQuestions.filter((q) => q.status === 'INCORRECT').length;
      const unansweredCount = allQuestions.length - answeredCount;

      const attemptNumber = parseInt(attempt.attempt_number || '1', 10);
      const totalAttempts = parseInt(attempt.total_attempts || '1', 10);

      const reconstructedReview = {
        attemptId: attempt.id,
        assessmentType: 'DIAGNOSTIC' as const,
        assessmentDefinition: {
          id: attempt.catalog_id || 'diagnostic-assessment',
          title: attempt.definition_title || 'Diagnostic Assessment',
          code: 'DIAG-ASSESS',
          durationMinutes: attempt.duration_minutes || 45,
        },
        attemptNumber,
        totalAttempts,
        candidate: {
          id: attempt.student_id,
          name: attempt.student_name || 'Candidate',
          email: attempt.student_email || 'student@clasptek.ai',
          candidateNumber: `CGA-${attempt.student_id.slice(0, 8).toUpperCase()}`,
        },
        attemptSummary: {
          status: attempt.status,
          evaluationState: 'COMPLETED',
          startedAt: attempt.started_at,
          submittedAt: attempt.closed_at || attempt.created_at,
          durationMinutes: attempt.duration_minutes || 45,
          overallScore: attempt.score ? parseFloat(attempt.score) : 0,
          officialScaledScore: result?.overall_score
            ? parseFloat(result.overall_score)
            : attempt.score
              ? parseFloat(attempt.score)
              : 0,
          officialScoreLabel:
            result?.predicted_band ||
            (attempt.score ? `${Math.round(parseFloat(attempt.score))}%` : 'Scored'),
          cefrLevel: result?.cefr_level || (parseFloat(attempt.score || '0') >= 75 ? 'B2' : 'B1'),
          scoreStatus: 'AVAILABLE' as const,
        },
        sections: {
          overview: {
            totalQuestions: allQuestions.length,
            answeredCount,
            correctCount,
            incorrectCount,
            unansweredCount,
            sectionSummaries: [
              {
                sectionKey: 'grammar',
                title: 'Grammar & Usage',
                questionCount: grammarQuestions.length,
                answeredCount: grammarQuestions.filter((q) => q.status !== 'UNANSWERED').length,
                correctCount: grammarQuestions.filter((q) => q.status === 'CORRECT').length,
                scorePercentage:
                  grammarQuestions.length > 0
                    ? Math.round(
                        (grammarQuestions.filter((q) => q.status === 'CORRECT').length /
                          grammarQuestions.length) *
                          100
                      )
                    : 0,
                status: 'AVAILABLE',
              },
              ...(readingPassages.length > 0
                ? [
                    {
                      sectionKey: 'reading',
                      title: 'Reading Comprehension',
                      questionCount: readingPassages[0].questions.length,
                      answeredCount: readingPassages[0].questions.filter(
                        (q: any) => q.status !== 'UNANSWERED'
                      ).length,
                      correctCount: readingPassages[0].questions.filter(
                        (q: any) => q.status === 'CORRECT'
                      ).length,
                      scorePercentage:
                        readingPassages[0].questions.length > 0
                          ? Math.round(
                              (readingPassages[0].questions.filter(
                                (q: any) => q.status === 'CORRECT'
                              ).length /
                                readingPassages[0].questions.length) *
                                100
                            )
                          : 0,
                      status: 'AVAILABLE',
                    },
                  ]
                : []),
            ],
          },
          grammar: {
            totalQuestions: grammarQuestions.length,
            questions: grammarQuestions,
          },
          reading:
            readingPassages.length > 0
              ? { totalQuestions: readingPassages[0].questions.length, passages: readingPassages }
              : undefined,
          listening:
            listeningSections.length > 0
              ? {
                  totalQuestions: listeningSections[0].questions.length,
                  sections: listeningSections,
                }
              : undefined,
          writing: writingTasks.length > 0 ? { tasks: writingTasks } : undefined,
        },
      };

      return NextResponse.json({
        success: true,
        data: {
          attempt: {
            id: attempt.id,
            studentId: attempt.student_id,
            studentName: attempt.student_name || 'Candidate',
            studentEmail: attempt.student_email || 'student@clasptek.ai',
            status: attempt.status,
            score: attempt.score ? parseFloat(attempt.score) : 0,
            durationMinutes: attempt.duration_minutes || 45,
            startedAt: attempt.started_at,
            submittedAt: attempt.closed_at,
            expiresAt: attempt.expires_at,
            attemptNumber,
            totalAttempts,
            definitionTitle: attempt.definition_title || 'Diagnostic Assessment',
          },
          result: result
            ? {
                overallScore: parseFloat(result.overall_score || '0'),
                cefrLevel: result.cefr_level,
                predictedBand: result.predicted_band,
                placementLevel: result.placement_level,
                recommendedCourse: result.recommended_course,
                recommendedDuration: result.recommended_duration,
                sectionScores:
                  typeof result.section_scores === 'string'
                    ? JSON.parse(result.section_scores)
                    : result.section_scores,
                strengths:
                  typeof result.strengths === 'string'
                    ? JSON.parse(result.strengths)
                    : result.strengths,
                weaknesses:
                  typeof result.weaknesses === 'string'
                    ? JSON.parse(result.weaknesses)
                    : result.weaknesses,
                aiFeedback:
                  typeof result.ai_feedback === 'string'
                    ? JSON.parse(result.ai_feedback)
                    : result.ai_feedback,
              }
            : null,
          answers: answersMap,
          paperSnapshot,
          auditTimeline,
          reconstructedReview,
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Check Mock Examination Sessions (public.mock_sessions)
    // ──────────────────────────────────────────────────────────────────────────
    const mockRes = await pool.query(
      `SELECT 
        ms.*, 
        au.email as student_email, 
        COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as student_name,
        (SELECT COUNT(*) FROM public.mock_sessions m2 
         WHERE m2.student_id = ms.student_id 
           AND m2.template_id = ms.template_id 
           AND m2.started_at <= ms.started_at) as attempt_number,
        (SELECT COUNT(*) FROM public.mock_sessions m3 
         WHERE m3.student_id = ms.student_id 
           AND m3.template_id = ms.template_id) as total_attempts,
        mb.title as definition_title
       FROM public.mock_sessions ms
       LEFT JOIN auth.users au ON (au.id::text = ms.student_id::text)
       LEFT JOIN public.profiles p ON (p.user_id = ms.student_id OR p.id = ms.student_id)
       LEFT JOIN public.mock_blueprints mb ON (mb.id = ms.template_id)
       WHERE ms.id = $1`,
      [attemptId]
    );

    if (mockRes.rows.length > 0) {
      const ms = mockRes.rows[0];

      if (filterStudentId) {
        const studentMatch = await pool.query(
          `SELECT 1 FROM auth.users au 
           LEFT JOIN public.profiles p ON (p.user_id = au.id OR p.id = au.id)
           WHERE (au.id::text = $1 OR au.email ILIKE $1 OR p.id::text = $1 OR p.user_id::text = $1)
             AND (au.id::text = $2 OR p.id::text = $2 OR p.user_id::text = $2)`,
          [filterStudentId, ms.student_id]
        );
        if (studentMatch.rows.length === 0 && ms.student_id !== filterStudentId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Forbidden: Mock attempt does not belong to requested student',
            },
            { status: 403 }
          );
        }
      }

      // Fetch Mock Result
      const mrRes = await pool.query(
        `SELECT * FROM public.mock_results WHERE session_id = $1 ORDER BY scored_at DESC LIMIT 1`,
        [attemptId]
      );
      const mr = mrRes.rows[0] || null;

      // Fetch Question Snapshots joined with question_versions for authoritative answers (ordered by display_order ASC)
      const snapshotsRes = await pool.query(
        `SELECT sqs.id, sqs.question_id, sqs.question_version_id, sqs.passage_version_id, sqs.display_order, sqs.blueprint_version, sqs.snapshot_payload,
                qv.payload as qv_payload
         FROM public.session_question_snapshots sqs
         LEFT JOIN public.question_versions qv ON qv.id = sqs.question_version_id
         WHERE sqs.session_id = $1
         ORDER BY sqs.display_order ASC`,
        [attemptId]
      );

      // Fetch Candidate Attempt & Answers from mock_attempt_answers
      const attemptAnswersRes = await pool.query(
        `SELECT ma.id as attempt_id, ma.current_question_index, ma.answers_count,
                maa.id as answer_id, maa.question_id, maa.section_id, maa.answer_payload,
                maa.time_spent_ms, maa.is_correct, maa.created_at as answer_created_at
         FROM public.mock_attempts ma
         LEFT JOIN public.mock_attempt_answers maa ON maa.attempt_id = ma.id
         WHERE ma.session_id = $1`,
        [attemptId]
      );

      const answersMap: Record<string, any> = {};
      attemptAnswersRes.rows.forEach((r) => {
        if (r.question_id) {
          answersMap[r.question_id] = {
            answerId: r.answer_id,
            sectionId: r.section_id,
            responsePayload: r.answer_payload,
            isCorrect: r.is_correct,
            timeSpentMs: r.time_spent_ms,
            updatedAt: r.answer_created_at,
          };
        }
      });

      // Fetch Mock Section Scores
      const secScoresRes = await pool.query(
        `SELECT mss.* 
         FROM public.mock_section_scores mss
         JOIN public.mock_results mr ON mr.id = mss.result_id
         WHERE mr.session_id = $1`,
        [attemptId]
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

      // Fetch Subjective Evaluations (Writing & Speaking)
      const subRes = await pool.query(
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
         LEFT JOIN public.subjective_evaluation_criteria sec ON se.id = sec.evaluation_id
         WHERE se.session_id = $1
         GROUP BY se.id
         ORDER BY se.created_at ASC`,
        [attemptId]
      );

      // Fetch Speaking Recordings
      const spkRes = await pool.query(
        `SELECT * FROM public.speaking_recordings WHERE session_id = $1 ORDER BY part_number ASC, created_at ASC`,
        [attemptId]
      );

      // Fetch Writing Band Rubrics
      const rubricsRes = await pool.query(
        `SELECT criterion, band_score, descriptor FROM public.writing_band_rubrics ORDER BY criterion, band_score DESC`
      );
      const writingRubricsList = rubricsRes.rows.map((r) => ({
        criterion: r.criterion,
        bandScore: parseFloat(r.band_score),
        descriptor: r.descriptor,
      }));

      // Prefetch listening tracks to supplement audio metadata
      const tracksRes = await pool.query(
        `SELECT id, code, title, url, duration_seconds, transcript FROM public.listening_tracks`
      );
      const tracksMap: Record<string, any> = {};
      tracksRes.rows.forEach((t) => {
        tracksMap[t.id] = t;
        if (t.code) tracksMap[t.code] = t;
      });

      // Prefetch reading passages
      const passagesRes = await pool.query(
        `SELECT id, code, title, content, word_count FROM public.reading_passages`
      );
      const passagesMap: Record<string, any> = {};
      passagesRes.rows.forEach((p) => {
        passagesMap[p.id] = p;
        if (p.code) passagesMap[p.code] = p;
        if (p.title) passagesMap[p.title.trim().toLowerCase()] = p;
      });

      // Group Snapshots by Section
      const rawListeningQuestions: any[] = [];
      const rawReadingQuestions: any[] = [];
      const rawWritingQuestions: any[] = [];
      const rawSpeakingQuestions: any[] = [];

      snapshotsRes.rows.forEach((row, idx) => {
        const payload = row.snapshot_payload || {};
        const qvPayload = row.qv_payload || {};
        const qId = row.question_id || payload.questionId;
        const ansObj = answersMap[qId];
        const studentAns = extractStudentAnswer(ansObj);

        const correctAns =
          payload.options?.find((o: any) => o.isCorrect)?.code ||
          payload.correctOptionCode ||
          payload.correctAnswer ||
          payload.acceptedAnswers?.[0] ||
          qvPayload.options?.find((o: any) => o.isCorrect)?.code ||
          qvPayload.correctOptionCode ||
          qvPayload.correctAnswer ||
          qvPayload.acceptedAnswers?.[0] ||
          qvPayload.solution?.correctOptionCode ||
          qvPayload.solution?.correctAnswer ||
          null;

        const isCorrect =
          ansObj?.isCorrect ??
          (studentAns && correctAns
            ? String(studentAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase()
            : null);
        const itemType = payload.itemType || qvPayload.type || 'MCQ';
        const status = determineQuestionStatus(isCorrect, studentAns, itemType);
        const explanation = payload.explanation || qvPayload.explanation || null;

        const rawOptions =
          payload.options && payload.options.length > 0 ? payload.options : qvPayload.options || [];
        const options = rawOptions.map((o: any) => ({
          code: o.code,
          text: o.text,
          isCorrect: (correctAns && o.code === correctAns) || Boolean(o.isCorrect),
        }));

        const formattedItem: ReconstructedQuestion & { rawPayload: any } = {
          id: qId,
          order: row.display_order || idx + 1,
          code: payload.code || qvPayload.code || `Q-${idx + 1}`,
          section: payload.sectionName || qvPayload.section || 'Listening',
          itemType,
          difficulty: payload.difficulty || qvPayload.difficulty || 'MEDIUM',
          prompt: payload.prompt || qvPayload.prompt || '',
          options,
          studentAnswer: studentAns,
          correctAnswer: correctAns,
          status,
          isCorrect,
          explanation,
          timeSpentMs: ansObj?.timeSpentMs || 0,
          rawPayload: payload,
        };

        const secName = (payload.sectionName || '').toLowerCase();
        if (secName.includes('listen') || payload.audio) {
          rawListeningQuestions.push(formattedItem);
        } else if (secName.includes('read') || payload.passage) {
          rawReadingQuestions.push(formattedItem);
        } else if (
          secName.includes('write') ||
          ['WRITING_TASK_1', 'WRITING_TASK_2', 'ESSAY'].includes(payload.itemType)
        ) {
          rawWritingQuestions.push(formattedItem);
        } else if (
          secName.includes('speak') ||
          ['SPEAKING_PROMPT'].includes(payload.itemType) ||
          payload.speaking
        ) {
          rawSpeakingQuestions.push(formattedItem);
        } else {
          if (rawListeningQuestions.length < 40) rawListeningQuestions.push(formattedItem);
          else if (rawReadingQuestions.length < 40) rawReadingQuestions.push(formattedItem);
          else rawWritingQuestions.push(formattedItem);
        }
      });

      // ─── RECONSTRUCT LISTENING SECTIONS ──────────────────────────────────
      // Partition into 4 standard sections (1-10, 11-20, 21-30, 31-40)
      const listeningSectionDefs = [
        {
          num: 1,
          title: 'Section 1: Social Needs / Transactional Conversation',
          defaultTrack: '/audio/section-1.mpeg',
        },
        {
          num: 2,
          title: 'Section 2: General Interest Monologue',
          defaultTrack: '/audio/section-2.mpeg',
        },
        {
          num: 3,
          title: 'Section 3: Academic Discussion / Tutorial',
          defaultTrack: '/audio/section-3.mpeg',
        },
        {
          num: 4,
          title: 'Section 4: Academic Lecture Monologue',
          defaultTrack: '/audio/section-4.mpeg',
        },
      ];

      const reconstructedListeningSections = listeningSectionDefs.map((sDef) => {
        const startIdx = (sDef.num - 1) * 10;
        const questions = rawListeningQuestions.slice(startIdx, startIdx + 10);
        const sampleAudio = questions[0]?.rawPayload?.audio;

        let audioUrl = normalizeAudioUrl(sampleAudio?.trackUrl || sDef.defaultTrack);
        let transcript = null;
        let durationSeconds =
          sampleAudio?.durationSeconds ||
          (sDef.num === 1 ? 360 : sDef.num === 2 ? 390 : sDef.num === 3 ? 420 : 450);
        let title = sampleAudio?.trackTitle || sampleAudio?.sectionTitle || sDef.title;

        // Check if track exists in tracksMap
        if (sampleAudio?.trackId && tracksMap[sampleAudio.trackId]) {
          const t = tracksMap[sampleAudio.trackId];
          audioUrl = normalizeAudioUrl(t.url || audioUrl);
          transcript = t.transcript || null;
          durationSeconds = t.duration_seconds || durationSeconds;
          title = t.title || title;
        }

        return {
          sectionNumber: sDef.num,
          title,
          audioUrl,
          transcript,
          durationSeconds,
          questions: questions.map(({ rawPayload, ...q }) => q),
        };
      });

      // ─── RECONSTRUCT READING PASSAGES ────────────────────────────────────
      // Partition into 3 standard passages (Questions 1-13, 14-26, 27-40)
      const passageSplits = [
        { num: 1, start: 0, count: 13, defaultTitle: 'Passage 1: General Academic Text' },
        {
          num: 2,
          start: 13,
          count: 13,
          defaultTitle: 'Passage 2: Scientific & Work-Related Article',
        },
        { num: 3, start: 26, count: 14, defaultTitle: 'Passage 3: Complex Discursive Analysis' },
      ];

      const reconstructedReadingPassages = passageSplits.map((pDef) => {
        const questions = rawReadingQuestions.slice(pDef.start, pDef.start + pDef.count);
        const samplePassage = questions[0]?.rawPayload?.passage;

        let title = pDef.defaultTitle;
        let content = '';
        let wordCount = 0;
        let code = undefined;

        if (typeof samplePassage === 'object' && samplePassage !== null) {
          title = samplePassage.title || title;
          content = samplePassage.content || '';
          wordCount = samplePassage.wordCount || (content ? content.trim().split(/\s+/).length : 0);
          code = samplePassage.code;
        } else if (typeof samplePassage === 'string') {
          title = samplePassage;
          const found = passagesMap[samplePassage.trim().toLowerCase()];
          if (found) {
            content = found.content;
            wordCount = found.word_count;
            code = found.code;
          }
        }

        // If content still empty, attempt fallback to passagesMap by order
        if (!content) {
          const passCodes = ['PAS-READ-001', 'PAS-READ-002', 'PAS-READ-003'];
          const fallback = passagesMap[passCodes[pDef.num - 1]];
          if (fallback) {
            title = fallback.title || title;
            content = fallback.content || '';
            wordCount = fallback.word_count || 0;
            code = fallback.code;
          }
        }

        return {
          passageNumber: pDef.num,
          title,
          code,
          content,
          wordCount,
          questions: questions.map(({ rawPayload, ...q }) => q),
        };
      });

      // ─── RECONSTRUCT WRITING TASKS ───────────────────────────────────────
      const reconstructedWritingTasks = [
        {
          taskNumber: 1,
          defaultTitle: 'Task 1: Academic Report & Visual Synthesis',
          defaultPrompt:
            'The diagram illustrates the sequential stages of the industrial process. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
          defaultInstructions:
            'You should spend about 20 minutes on this task. Write at least 150 words.',
          minWords: 150,
        },
        {
          taskNumber: 2,
          defaultTitle: 'Task 2: Discursive Essay & Argument',
          defaultPrompt:
            'Some people believe that university education should be freely available to all students regardless of background. To what extent do you agree or disagree?',
          defaultInstructions:
            'You should spend about 40 minutes on this task. Write at least 250 words.',
          minWords: 250,
        },
      ].map((def, idx) => {
        const rawQ = rawWritingQuestions[idx];
        const taskNumber = def.taskNumber;

        // Match subjective evaluation for Writing
        const matchingEval =
          subRes.rows.find(
            (s: any) =>
              s.skill === 'Writing' &&
              (s.question_id === rawQ?.id ||
                s.metadata?.taskType === `TASK_${taskNumber}` ||
                s.metadata?.taskNumber === taskNumber ||
                s.response_id === `writing-task-${taskNumber}`)
          ) || subRes.rows.filter((s: any) => s.skill === 'Writing')[idx];

        const ansObj = rawQ?.id ? answersMap[rawQ.id] : null;
        const submittedEssay =
          matchingEval?.raw_response_reference || extractStudentAnswer(ansObj) || '';

        const payload = rawQ?.rawPayload || {};
        const stimulusImageUrl = normalizeImageUrl(
          payload.imageUrl ||
            payload.stimulusUrl ||
            payload.stimulusImage ||
            (taskNumber === 1 ? '/images/stimuli/rough-diamond-process.png' : null)
        );

        const prompt = payload.prompt || matchingEval?.metadata?.taskPrompt || def.defaultPrompt;
        const instructions =
          payload.group?.instructions || payload.instructions || def.defaultInstructions;
        const title = payload.group?.title || def.defaultTitle;

        const essayStr =
          typeof submittedEssay === 'string' ? submittedEssay : JSON.stringify(submittedEssay);
        const wordCount = essayStr.trim() ? essayStr.trim().split(/\s+/).length : 0;

        return {
          taskNumber,
          title,
          prompt,
          instructions,
          stimulusImageUrl,
          minWords: def.minWords,
          studentEssay: essayStr,
          wordCount,
          evaluationState: matchingEval
            ? matchingEval.status
            : essayStr
              ? 'PENDING_REVIEW'
              : 'NOT_SUBMITTED',
          overallScore: matchingEval?.overall_score ? parseFloat(matchingEval.overall_score) : null,
          scoreLabel:
            matchingEval?.score_label ||
            (matchingEval?.overall_score
              ? `Band ${parseFloat(matchingEval.overall_score).toFixed(1)}`
              : null),
          feedback: matchingEval?.feedback || null,
          criteria: (matchingEval?.criteria || []).map((c: any) => ({
            criterionName: c.criterionName,
            score: parseFloat(c.score || '0'),
            maxScore: parseFloat(c.maxScore || '9'),
            feedback: c.feedback || '',
          })),
          rubrics: writingRubricsList,
        };
      });

      // ─── RECONSTRUCT SPEAKING PARTS ──────────────────────────────────────
      const reconstructedSpeakingParts = [
        {
          partNumber: 1,
          defaultTitle: 'Speaking Part 1: Introduction and Interview',
          defaultInstructions:
            'Answer questions about familiar everyday topics, work, studies, and personal interests.',
          defaultPrompt: 'Can you tell me about your studies or current work?',
        },
        {
          partNumber: 2,
          defaultTitle: 'Speaking Part 2: Individual Long Turn',
          defaultInstructions:
            'You have 1 minute to prepare your response and notes. You will then speak for 1 to 2 minutes.',
          defaultPrompt:
            'Describe a skill that you learned and found useful.\n\nYou should say:\n- what the skill is\n- when and how you learned it\n- how you have used it\n\nand explain why you think this skill is useful.',
        },
        {
          partNumber: 3,
          defaultTitle: 'Speaking Part 3: Two-Way Discussion',
          defaultInstructions:
            'Discuss more abstract issues and ideas linked to the topic in Part 2.',
          defaultPrompt:
            'What kinds of skills are most important for young people to develop in modern society?',
        },
      ].map((def, idx) => {
        const rawQ = rawSpeakingQuestions[idx];
        const partNumber = def.partNumber;

        // Match recording
        const rec =
          spkRes.rows.find(
            (r: any) => r.part_number === partNumber || r.question_id === rawQ?.id
          ) || spkRes.rows[idx];

        // Match evaluation
        const matchingEval =
          subRes.rows.find(
            (s: any) =>
              s.skill === 'Speaking' &&
              (s.question_id === rawQ?.id ||
                s.metadata?.partNumber === partNumber ||
                s.response_id === `speaking-part-${partNumber}`)
          ) || subRes.rows.filter((s: any) => s.skill === 'Speaking')[idx];

        const ansObj = rawQ?.id ? answersMap[rawQ.id] : null;
        const transcript =
          matchingEval?.transcript ||
          matchingEval?.raw_response_reference ||
          ansObj?.responsePayload?.transcript ||
          ansObj?.responsePayload?.textResponse ||
          null;

        const payload = rawQ?.rawPayload || {};
        const prompt = payload.prompt || matchingEval?.metadata?.taskPrompt || def.defaultPrompt;
        const instructions = payload.group?.instructions || def.defaultInstructions;
        const title = payload.group?.title || def.defaultTitle;

        const cueCard =
          partNumber === 2
            ? {
                topic:
                  payload.speaking?.topic || 'Describe a skill that you learned and found useful.',
                prepTimeSeconds: payload.speaking?.prepTimeSeconds || 60,
                speakingTimeSeconds: payload.speaking?.speakingTimeSeconds || 120,
                prompt,
              }
            : null;

        const audioUrl = normalizeAudioUrl(rec?.audio_url || null);

        return {
          partNumber,
          title,
          prompt,
          instructions,
          cueCard,
          audioUrl,
          durationSeconds: rec?.duration_seconds || 0,
          transcript,
          evaluationState: matchingEval
            ? matchingEval.status
            : audioUrl
              ? 'PENDING_REVIEW'
              : 'NOT_RECORDED',
          overallScore: matchingEval?.overall_score ? parseFloat(matchingEval.overall_score) : null,
          scoreLabel:
            matchingEval?.score_label ||
            (matchingEval?.overall_score
              ? `Band ${parseFloat(matchingEval.overall_score).toFixed(1)}`
              : null),
          feedback: matchingEval?.feedback || null,
          criteria: (matchingEval?.criteria || []).map((c: any) => ({
            criterionName: c.criterionName,
            score: parseFloat(c.score || '0'),
            maxScore: parseFloat(c.maxScore || '9'),
            feedback: c.feedback || '',
          })),
        };
      });

      // ─── COMPUTE OVERALL SCORES & STATS ──────────────────────────────────
      const allListeningQs = reconstructedListeningSections.flatMap((s) => s.questions);
      const allReadingQs = reconstructedReadingPassages.flatMap((p) => p.questions);
      const allObjectiveQs = [...allListeningQs, ...allReadingQs];

      const answeredCount = allObjectiveQs.filter((q) => q.status !== 'UNANSWERED').length;
      const correctCount = allObjectiveQs.filter((q) => q.status === 'CORRECT').length;
      const incorrectCount = allObjectiveQs.filter((q) => q.status === 'INCORRECT').length;
      const unansweredCount = allObjectiveQs.length - answeredCount;

      const listeningCorrect = allListeningQs.filter((q) => q.status === 'CORRECT').length;
      const readingCorrect = allReadingQs.filter((q) => q.status === 'CORRECT').length;

      const attemptNumber = parseInt(ms.attempt_number || '1', 10);
      const totalAttempts = parseInt(ms.total_attempts || '1', 10);

      const overallBand = mr?.official_scaled_score
        ? parseFloat(mr.official_scaled_score)
        : ms.official_scaled_score
          ? parseFloat(ms.official_scaled_score)
          : 0;

      const scoreStatus: 'AVAILABLE' | 'PARTIAL' | 'PENDING' | 'NOT_SCORED' =
        overallBand > 0
          ? 'AVAILABLE'
          : listeningCorrect > 0 || readingCorrect > 0
            ? 'PARTIAL'
            : ms.status === 'IN_PROGRESS'
              ? 'NOT_SCORED'
              : 'PENDING';

      const reconstructedReview = {
        attemptId: ms.id,
        assessmentType: 'MOCK' as const,
        assessmentDefinition: {
          id: ms.template_id || 'ielts-academic-mock',
          title:
            ms.definition_title || `${ms.exam_type || 'IELTS Academic'} Official Mock Examination`,
          code: ms.exam_type || 'IELTS-MOCK',
          durationMinutes: 165,
        },
        attemptNumber,
        totalAttempts,
        candidate: {
          id: ms.student_id,
          name: ms.student_name || 'Candidate',
          email: ms.student_email || 'student@clasptek.ai',
          candidateNumber: `CGA-${ms.student_id.slice(0, 8).toUpperCase()}`,
        },
        attemptSummary: {
          status: ms.status,
          evaluationState: ms.evaluation_state || 'SUBMITTED',
          startedAt: ms.started_at,
          submittedAt: ms.submitted_at,
          durationMinutes: ms.time_remaining_seconds
            ? Math.round((9900 - ms.time_remaining_seconds) / 60)
            : 165,
          overallScore: parseFloat(ms.score_percentage || '0'),
          officialScaledScore: overallBand,
          officialScoreLabel:
            ms.official_score_label ||
            (overallBand ? `Band ${overallBand.toFixed(1)}` : 'Pending Evaluation'),
          cefrLevel:
            mr?.cefr_level || (overallBand >= 7.5 ? 'C1' : overallBand >= 5.5 ? 'B2' : 'B1'),
          scoreStatus,
        },
        sections: {
          overview: {
            totalQuestions: allObjectiveQs.length,
            answeredCount,
            correctCount,
            incorrectCount,
            unansweredCount,
            sectionSummaries: [
              {
                sectionKey: 'listening',
                title: 'Listening Comprehension',
                questionCount: allListeningQs.length,
                answeredCount: allListeningQs.filter((q) => q.status !== 'UNANSWERED').length,
                correctCount: listeningCorrect,
                scorePercentage:
                  allListeningQs.length > 0
                    ? Math.round((listeningCorrect / allListeningQs.length) * 100)
                    : 0,
                bandScore: sectionScoresMap['listening']?.scaledScore || undefined,
                status: 'AVAILABLE',
              },
              {
                sectionKey: 'reading',
                title: 'Academic Reading',
                questionCount: allReadingQs.length,
                answeredCount: allReadingQs.filter((q) => q.status !== 'UNANSWERED').length,
                correctCount: readingCorrect,
                scorePercentage:
                  allReadingQs.length > 0
                    ? Math.round((readingCorrect / allReadingQs.length) * 100)
                    : 0,
                bandScore: sectionScoresMap['reading']?.scaledScore || undefined,
                status: 'AVAILABLE',
              },
              {
                sectionKey: 'writing',
                title: 'Academic Writing',
                questionCount: 2,
                answeredCount: reconstructedWritingTasks.filter((t) => t.studentEssay).length,
                correctCount: 0,
                scorePercentage: reconstructedWritingTasks[0]?.overallScore
                  ? reconstructedWritingTasks[0].overallScore * 10
                  : 0,
                bandScore: reconstructedWritingTasks[0]?.overallScore || undefined,
                status: reconstructedWritingTasks[0]?.evaluationState || 'PENDING_REVIEW',
              },
              {
                sectionKey: 'speaking',
                title: 'Speaking Evaluation',
                questionCount: 3,
                answeredCount: reconstructedSpeakingParts.filter((p) => p.audioUrl || p.transcript)
                  .length,
                correctCount: 0,
                scorePercentage: reconstructedSpeakingParts[0]?.overallScore
                  ? reconstructedSpeakingParts[0].overallScore * 10
                  : 0,
                bandScore: reconstructedSpeakingParts[0]?.overallScore || undefined,
                status: reconstructedSpeakingParts[0]?.evaluationState || 'PENDING_REVIEW',
              },
            ],
          },
          listening: {
            totalQuestions: allListeningQs.length,
            sections: reconstructedListeningSections,
          },
          reading: {
            totalQuestions: allReadingQs.length,
            passages: reconstructedReadingPassages,
          },
          writing: {
            tasks: reconstructedWritingTasks,
          },
          speaking: {
            parts: reconstructedSpeakingParts,
          },
        },
      };

      // Backward compatible mock paper snapshot
      const mockPaperSnapshot = {
        snapshotVersion: 1,
        assessment: {
          id: ms.template_id,
          code: ms.exam_type || 'IELTS-MOCK',
          title:
            ms.definition_title || `${ms.exam_type || 'IELTS Academic'} Official Mock Examination`,
          durationMinutes: 165,
        },
        grammarQuestions: allListeningQs,
        listeningQuestions: allListeningQs,
        readingPassage: {
          title: reconstructedReadingPassages[0]?.title || 'IELTS Academic Reading',
          content: reconstructedReadingPassages[0]?.content || '',
          comprehensionQuestions: allReadingQs,
        },
        readingPassages: reconstructedReadingPassages,
        writingTasks: reconstructedWritingTasks,
        speakingItems: reconstructedSpeakingParts,
      };

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
        ...subRes.rows.map((s: any) => ({
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

      return NextResponse.json({
        success: true,
        data: {
          attempt: {
            id: ms.id,
            studentId: ms.student_id,
            studentName: ms.student_name || 'Candidate',
            studentEmail: ms.student_email || 'student@clasptek.ai',
            candidateNumber: `CGA-${ms.student_id.slice(0, 8).toUpperCase()}`,
            status: ms.status,
            evaluationState: ms.evaluation_state,
            score: parseFloat(ms.score_percentage || '0'),
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
            attemptNumber,
            totalAttempts,
            definitionTitle:
              ms.definition_title ||
              `${ms.exam_type || 'IELTS Academic'} Official Mock Examination`,
          },
          result: {
            overallScore: overallBand,
            cefrLevel:
              mr?.cefr_level || (overallBand >= 7.5 ? 'C1' : overallBand >= 5.5 ? 'B2' : 'B1'),
            predictedBand:
              mr?.official_score_label ||
              ms.official_score_label ||
              (overallBand ? `Band ${overallBand.toFixed(1)}` : 'Pending Evaluation'),
            placementLevel: 'OFFICIAL_MOCK_EXAMINATION',
            recommendedCourse: 'IELTS Academic Masterclass',
            recommendedDuration: '8 Weeks',
            sectionScores: reconstructedReview.sections.overview.sectionSummaries,
            strengths: ['Official Test Timing & Protocol Adherence'],
            weaknesses:
              ms.evaluation_state === 'EVALUATING' ? ['Subjective Evaluation Pending'] : [],
            aiFeedback: {
              summary:
                ms.official_score_label ||
                'Mock examination session recorded. Full response reconstruction ready.',
              nextSteps: 'Review section-level performance and practice target bands.',
            },
          },
          answers: answersMap,
          paperSnapshot: mockPaperSnapshot,
          auditTimeline,
          reconstructedReview,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Assessment attempt or mock session not found' },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('GET /api/v1/admin/assessment-attempts/[id] error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
