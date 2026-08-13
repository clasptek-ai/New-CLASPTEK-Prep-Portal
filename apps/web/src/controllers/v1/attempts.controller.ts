import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { QuestionSelectionService } from '@/lib/question-selection-service';
import { getCanonicalProgramme, isSameCanonicalProgramme } from '@/lib/canonical-programme';
import { randomUUID } from 'crypto';

export async function createAssessmentAttemptController(req: NextRequest, _params: Record<string, string>): Promise<NextResponse> {
  const requestId = randomUUID();
  const startTime = Date.now();

  try {
    const session = await getAuthenticatedSession(req);
    const body = await req.json().catch(() => ({}));
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);

    if (!studentId) {
      console.log(
        `[AUTH_TELEMETRY] RequestID: ${requestId} | UserID: NONE | CandidateID: NONE | AssessmentID: N/A | AttemptID: N/A | Endpoint: POST /api/v1/assessment-attempts | Result: 401_UNAUTHORIZED | Duration: ${Date.now() - startTime}ms`
      );
      return NextResponse.json(
        { success: false, error: 'Unauthorized', requestId },
        { status: 401 }
      );
    }

    const tenantId = session?.tenantId || '00000000-0000-0000-0000-000000000000';
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const enrollmentRes = await client.query(
        `SELECT 
           spe.programme_id as enrollment_programme_id,
           p.target_programme as profile_programme,
           au.raw_user_meta_data->>'programme' as meta_programme
         FROM auth.users au
         LEFT JOIN public.profiles p ON p.user_id = au.id OR p.id = au.id
         LEFT JOIN public.student_programme_enrollments spe 
           ON spe.student_id = au.id AND spe.enrollment_status = 'ACTIVE'
         WHERE au.id = $1
         ORDER BY spe.enrolled_at DESC NULLS LAST
         LIMIT 1`,
        [studentId]
      );

      const row = enrollmentRes.rows[0];
      const rawProgramme = row?.enrollment_programme_id || row?.profile_programme || row?.meta_programme || 'IELTS_ACADEMIC';
      const canonicalStudentProg = getCanonicalProgramme(rawProgramme);

      let definition: any = null;

      if (body.assessmentId) {
        const defRes = await client.query(
          `SELECT ad.*, paa.programme_id as assigned_programme_id 
           FROM public.assessment_definitions ad
           LEFT JOIN public.programme_assessment_assignments paa 
             ON paa.assessment_definition_id = ad.id AND paa.is_active = true
           WHERE ad.id = $1 AND ad.status = 'PUBLISHED'`,
          [body.assessmentId]
        );
        const targetDef = defRes.rows[0];
        if (targetDef) {
          const targetProgKey = targetDef.assigned_programme_id || targetDef.exam_type || 'ENG-PROF-DIAG';
          const matchesProgramme =
            targetDef.code === 'ENG-PROF-DIAG' ||
            isSameCanonicalProgramme(targetProgKey, canonicalStudentProg.id);

          if (matchesProgramme) {
            definition = targetDef;
          } else {
            await client.query('ROLLBACK');
            return NextResponse.json(
              {
                success: false,
                error: 'UNAUTHORIZED_ASSESSMENT_ASSIGNMENT',
                message: 'The requested assessment is not assigned to your active programme.',
                requestId,
              },
              { status: 403 }
            );
          }
        }
      }

      if (!definition) {
        const assignRes = await client.query(
          `SELECT ad.* FROM public.programme_assessment_assignments paa
           JOIN public.assessment_definitions ad ON ad.id = paa.assessment_definition_id
           WHERE paa.programme_id = ANY($1::text[])
             AND paa.is_active = true 
             AND ad.status = 'PUBLISHED'
           LIMIT 1`,
          [canonicalStudentProg.aliases]
        );
        definition = assignRes.rows[0];
      }

      if (!definition) {
        const defRes = await client.query(
          `SELECT * FROM public.assessment_definitions
           WHERE (exam_type = ANY($1::text[]) OR code = 'ENG-PROF-DIAG') 
             AND status = 'PUBLISHED'
           ORDER BY created_at DESC LIMIT 1`,
          [canonicalStudentProg.aliases]
        );
        definition = defRes.rows[0];
      }

      if (!definition) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: 'NO_PUBLISHED_ASSESSMENT',
            message: 'No published assessment definition found.',
            requestId,
          },
          { status: 404 }
        );
      }

      const activeRes = await client.query(
        `SELECT id, started_at, expires_at FROM public.assessment_attempts
         WHERE student_id = $1
           AND status = 'IN_PROGRESS'
           AND (expires_at IS NULL OR expires_at > NOW())
           AND deleted_at IS NULL
         ORDER BY started_at DESC LIMIT 1`,
        [studentId]
      );

      if (activeRes.rows.length > 0) {
        await client.query('ROLLBACK');
        const active = activeRes.rows[0];
        return NextResponse.json({
          success: true,
          data: {
            attemptId: active.id,
            resumed: true,
            startedAt: active.started_at,
            expiresAt: active.expires_at,
          },
          attemptId: active.id,
          meta: { timestamp: new Date().toISOString(), version: 1, requestId },
        });
      }

      const grammarCountRes = await client.query(`
        SELECT count(DISTINCT q.id) as cnt
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL
      `);
      const grammarCount = parseInt(grammarCountRes.rows[0]?.cnt || '0', 10);

      const passageCountRes = await client.query(`
        SELECT count(*) as cnt FROM public.reading_passages
        WHERE status = 'published' OR status IS NOT NULL
      `);
      const passageCount = parseInt(passageCountRes.rows[0]?.cnt || '0', 10);

      const writingCountRes = await client.query(`
        SELECT count(*) as cnt FROM public.writing_tasks
        WHERE exam_type = 'English Proficiency' OR exam_type IS NOT NULL
      `);
      const writingCount = parseInt(writingCountRes.rows[0]?.cnt || '0', 10);

      if (grammarCount < 30 || passageCount < 1 || writingCount < 2) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: 'DIAGNOSTIC_INSUFFICIENT_INVENTORY',
            message: 'Assessment temporarily unavailable due to insufficient question inventory.',
            requirements: { grammar: 30, passages: 1, writing: 2 },
            available: { grammar: grammarCount, passages: passageCount, writing: writingCount },
            requestId,
          },
          { status: 422 }
        );
      }

      const generatedSnapshot = await QuestionSelectionService.generatePaperSnapshot(client, {
        studentId,
        examType: canonicalStudentProg.title,
        grammarCount: 30,
        passageCount: 1,
        writingCount: 2,
      });

      const now = new Date();
      const durationMins = definition.duration_minutes || 45;
      const expiresAt = new Date(now.getTime() + durationMins * 60 * 1000);

      const paperSnapshot = {
        snapshotVersion: 1,
        assessmentVersionId: definition.id,
        generatedAt: now.toISOString(),
        generator: 'clasptek-assessment-engine-rc1',
        assessment: {
          id: definition.id,
          code: definition.code,
          title: definition.title,
          durationMinutes: durationMins,
        },
        grammarQuestions: generatedSnapshot.grammarQuestions,
        readingPassage: generatedSnapshot.readingPassage,
        writingTasks: generatedSnapshot.writingTasks,
        scoring: {
          grammarWeight: 0.6,
          readingWeight: 0.2,
          writingWeight: 0.2,
          placementThresholds: {
            ADVANCED: 80,
            INTERMEDIATE: 50,
            FOUNDATION: 0,
          },
        },
      };

      const insertRes = await client.query(
        `INSERT INTO public.assessment_attempts (
          student_id, catalog_id, status, started_at, expires_at,
          duration_minutes, paper_snapshot, tenant_id, created_at, updated_at
        ) VALUES (
          $1, $2, 'IN_PROGRESS', NOW(), $3,
          $4, $5, $6, NOW(), NOW()
        ) RETURNING id, started_at, expires_at`,
        [
          studentId,
          definition.id,
          expiresAt.toISOString(),
          durationMins,
          JSON.stringify(paperSnapshot),
          tenantId,
        ]
      );

      const newAttempt = insertRes.rows[0];

      await client.query(
        `INSERT INTO public.assessment_attempt_events (
          attempt_id, event_type, event_payload, created_at
        ) VALUES ($1, 'ATTEMPT_STARTED', $2, NOW())`,
        [
          newAttempt.id,
          JSON.stringify({
            studentId,
            catalogId: definition.id,
            totalQuestions:
              generatedSnapshot.grammarQuestions.length +
              (generatedSnapshot.readingPassage?.comprehensionQuestions?.length || 0) +
              generatedSnapshot.writingTasks.length,
            requestId,
          }),
        ]
      );

      await client.query('COMMIT');

      console.log(
        `[AUTH_TELEMETRY] RequestID: ${requestId} | UserID: ${studentId} | CandidateID: ${studentId} | AssessmentID: ${definition.id} | AttemptID: ${newAttempt.id} | Endpoint: POST /api/v1/assessment-attempts | Result: SUCCESS_CREATED | Duration: ${Date.now() - startTime}ms`
      );

      return NextResponse.json({
        success: true,
        data: {
          attemptId: newAttempt.id,
          resumed: false,
          startedAt: newAttempt.started_at,
          expiresAt: newAttempt.expires_at,
          totalQuestions:
            generatedSnapshot.grammarQuestions.length +
            (generatedSnapshot.readingPassage?.comprehensionQuestions?.length || 0) +
            generatedSnapshot.writingTasks.length,
        },
        attemptId: newAttempt.id,
        meta: { timestamp: new Date().toISOString(), version: 1, requestId },
      });
    } catch (innerErr: any) {
      await client.query('ROLLBACK');
      console.error(`[${requestId}] POST /api/v1/assessment-attempts transaction error:`, innerErr);
      return NextResponse.json(
        { success: false, error: innerErr.message, requestId },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error(`[${requestId}] POST /api/v1/assessment-attempts error:`, err);
    return NextResponse.json({ success: false, error: err.message, requestId }, { status: 500 });
  }
}
