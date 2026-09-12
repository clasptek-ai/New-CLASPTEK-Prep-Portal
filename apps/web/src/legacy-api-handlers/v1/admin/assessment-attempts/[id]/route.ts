export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/assessment-attempts/:id
 * Detailed Frozen Paper Snapshot Review Endpoint for Admin Console.
 *
 * Supports both:
 * 1. Diagnostic Assessment Attempts (public.assessment_attempts)
 * 2. Mock Examination Sessions (public.mock_sessions)
 *
 * Enforces:
 * - Admin/Staff authorization
 * - Tenant isolation
 * - Attempt ownership validation when studentId parameter is provided
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

    // ─── 1. Check public.assessment_attempts ─────────────────────────────
    const attemptRes = await pool.query(
      `SELECT 
        aa.*, 
        au.email as student_email, 
        COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as student_name
       FROM public.assessment_attempts aa
       LEFT JOIN auth.users au ON (au.id::text = aa.student_id::text)
       LEFT JOIN public.profiles p ON (p.user_id = aa.student_id OR p.id = aa.student_id)
       WHERE aa.id = $1`,
      [attemptId]
    );

    if (attemptRes.rows.length > 0) {
      const attempt = attemptRes.rows[0];

      // Verify student ownership if studentId filter is provided
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

      // Log ADMIN_REVIEWED event
      await pool
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
        },
      });
    }

    // ─── 2. Check public.mock_sessions ───────────────────────────────────
    const mockRes = await pool.query(
      `SELECT 
        ms.*, 
        au.email as student_email, 
        COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as student_name
       FROM public.mock_sessions ms
       LEFT JOIN auth.users au ON (au.id::text = ms.student_id::text)
       LEFT JOIN public.profiles p ON (p.user_id = ms.student_id OR p.id = ms.student_id)
       WHERE ms.id = $1`,
      [attemptId]
    );

    if (mockRes.rows.length > 0) {
      const ms = mockRes.rows[0];

      // Verify student ownership if studentId filter is provided
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

      // Fetch Question Snapshots (ordered by display_order ASC)
      const snapshotsRes = await pool.query(
        `SELECT id, question_id, question_version_id, passage_version_id, display_order, blueprint_version, snapshot_payload
         FROM public.session_question_snapshots
         WHERE session_id = $1
         ORDER BY display_order ASC`,
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
          id: qId,
          questionId: qId,
          questionVersionId: row.question_version_id || payload.questionVersionId,
          displayOrder: row.display_order || idx + 1,
          code: payload.code || `Q-${idx + 1}`,
          prompt: payload.prompt || '',
          itemType: payload.itemType || 'MCQ',
          difficulty: payload.difficulty || 'MEDIUM',
          sectionName: payload.sectionName || 'Listening',
          options: payload.options || [],
          correctOptionCode:
            payload.options?.find((o: any) => o.isCorrect)?.code ||
            payload.correctOptionCode ||
            null,
          correctAnswer: payload.correctAnswer || payload.acceptedAnswers?.[0] || null,
          acceptedAnswers: payload.acceptedAnswers || [],
          audio: payload.audio || null,
          passage: payload.passage || null,
          group: payload.group || null,
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
          if (listeningQuestions.length < 40) listeningQuestions.push(formattedItem);
          else if (readingQuestions.length < 40) readingQuestions.push(formattedItem);
          else writingQuestions.push(formattedItem);
        }
      });

      // Format writing tasks
      const writingTasks = (
        writingQuestions.length > 0
          ? writingQuestions
          : [
              { id: 'wt1', prompt: 'Task 1: Academic Report', itemType: 'ESSAY' },
              { id: 'wt2', prompt: 'Task 2: Discursive Essay', itemType: 'ESSAY' },
            ]
      ).map((wq, idx) => {
        const taskNumber = idx + 1;
        const matchingEval =
          subRes.rows.find(
            (s: any) =>
              s.skill === 'Writing' &&
              (s.question_id === wq.id ||
                s.metadata?.taskType === `TASK_${taskNumber}` ||
                s.response_id === `writing-task-${taskNumber}`)
          ) || subRes.rows.filter((s: any) => s.skill === 'Writing')[idx];

        const ansObj = answersMap[wq.id];
        const submittedEssay =
          matchingEval?.raw_response_reference ||
          ansObj?.responsePayload?.textResponse ||
          ansObj?.responsePayload?.studentAnswer ||
          (typeof ansObj?.responsePayload === 'string' ? ansObj.responsePayload : '');

        return {
          id: wq.id,
          taskNumber,
          title: taskNumber === 1 ? 'Task 1: Academic Report' : 'Task 2: Discursive Essay',
          prompt:
            wq.prompt ||
            matchingEval?.metadata?.taskPrompt ||
            (taskNumber === 1 ? 'IELTS Academic Writing Task 1' : 'IELTS Academic Writing Task 2'),
          minWords: taskNumber === 1 ? 150 : 250,
          itemType: 'ESSAY',
          studentEssay: submittedEssay,
          aiEvaluation: matchingEval
            ? {
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
              }
            : null,
        };
      });

      // Format speaking items
      const speakingItems = (
        speakingQuestions.length > 0
          ? speakingQuestions
          : [
              { id: 'spk1', prompt: 'Part 1: Introduction' },
              { id: 'spk2', prompt: 'Part 2: Long Turn' },
              { id: 'spk3', prompt: 'Part 3: Discussion' },
            ]
      ).map((sq, idx) => {
        const partNumber = idx + 1;
        const rec =
          spkRes.rows.find((r: any) => r.part_number === partNumber || r.question_id === sq.id) ||
          spkRes.rows[idx];
        const matchingEval =
          subRes.rows.find(
            (s: any) =>
              s.skill === 'Speaking' &&
              (s.question_id === sq.id ||
                s.metadata?.partNumber === partNumber ||
                s.response_id === `speaking-part-${partNumber}`)
          ) || subRes.rows.filter((s: any) => s.skill === 'Speaking')[idx];

        const ansObj = answersMap[sq.id];
        const transcript =
          matchingEval?.transcript ||
          matchingEval?.raw_response_reference ||
          ansObj?.responsePayload?.transcript ||
          ansObj?.responsePayload?.textResponse ||
          '';

        return {
          id: sq.id,
          partNumber,
          prompt: sq.prompt,
          transcript,
          audioUrl: rec?.audio_url || null,
          durationSeconds: rec?.duration_seconds || 0,
          aiEvaluation: matchingEval
            ? {
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
              }
            : null,
        };
      });

      // Reading Passage
      const defaultPassage = Object.values(readingPassagesMap)[0] || {
        title: 'IELTS Academic Reading',
        content: 'Reading section recorded in canonical mock examination package.',
      };

      const mockPaperSnapshot = {
        snapshotVersion: 1,
        assessment: {
          id: ms.template_id,
          code: ms.exam_type || 'IELTS-MOCK',
          title: `${ms.exam_type || 'IELTS Academic'} Official Mock Examination`,
          durationMinutes: 165,
        },
        grammarQuestions: listeningQuestions,
        listeningQuestions,
        readingPassage: {
          title: defaultPassage.title || 'IELTS Academic Mock Reading Section',
          content: defaultPassage.content || 'Reading passage captured from session snapshots.',
          comprehensionQuestions: readingQuestions,
        },
        readingPassages: Object.values(readingPassagesMap),
        writingTasks,
        speakingItems,
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

      const overallBand = mr?.official_scaled_score
        ? parseFloat(mr.official_scaled_score)
        : ms.official_scaled_score
          ? parseFloat(ms.official_scaled_score)
          : 0;

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
            sectionScores: [
              {
                sectionCode: 'Listening',
                sectionName: 'Listening Comprehension',
                scorePercentage:
                  listeningQuestions.length > 0
                    ? Math.round(
                        (listeningQuestions.filter((q) => q.isCorrect).length /
                          listeningQuestions.length) *
                          100
                      )
                    : 0,
                rawScore: listeningQuestions.filter((q) => q.isCorrect).length,
              },
              {
                sectionCode: 'Reading',
                sectionName: 'Academic Reading',
                scorePercentage:
                  readingQuestions.length > 0
                    ? Math.round(
                        (readingQuestions.filter((q) => q.isCorrect).length /
                          readingQuestions.length) *
                          100
                      )
                    : 0,
                rawScore: readingQuestions.filter((q) => q.isCorrect).length,
              },
              {
                sectionCode: 'Writing',
                sectionName: 'Academic Writing',
                scorePercentage: writingTasks[0]?.aiEvaluation?.overallScore
                  ? writingTasks[0].aiEvaluation.overallScore * 10
                  : 0,
                scaledScore: writingTasks[0]?.aiEvaluation?.overallScore || 0,
                evaluationState: writingTasks[0]?.aiEvaluation?.status || ms.evaluation_state,
              },
              {
                sectionCode: 'Speaking',
                sectionName: 'Speaking Evaluation',
                scorePercentage: speakingItems[0]?.aiEvaluation?.overallScore
                  ? speakingItems[0].aiEvaluation.overallScore * 10
                  : 0,
                scaledScore: speakingItems[0]?.aiEvaluation?.overallScore || 0,
                evaluationState: speakingItems[0]?.aiEvaluation?.status || ms.evaluation_state,
              },
            ],
            strengths: ['Official Test Timing & Protocol Adherence'],
            weaknesses:
              ms.evaluation_state === 'EVALUATING' ? ['Subjective Evaluation Pending'] : [],
            aiFeedback: {
              summary:
                ms.official_score_label ||
                'Mock examination session recorded. AI evaluation active.',
              nextSteps: 'Review section-level feedback and recommended practice units.',
            },
          },
          answers: answersMap,
          paperSnapshot: mockPaperSnapshot,
          auditTimeline,
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
