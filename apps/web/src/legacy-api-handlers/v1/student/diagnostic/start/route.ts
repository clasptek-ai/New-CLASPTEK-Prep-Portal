export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { QuestionSelectionService } from '@/lib/question-selection-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId =
      session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = session?.tenantId || '00000000-0000-0000-0000-000000000000';

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Resolve student target programme & active assigned diagnostic definition
      let studentProgramme = 'English Proficiency';
      const profileRes = await client
        .query(`SELECT target_programme FROM public.profiles WHERE user_id = $1 OR id = $1`, [
          studentId,
        ])
        .catch(() => null);
      if (profileRes && profileRes.rows.length > 0 && profileRes.rows[0].target_programme) {
        studentProgramme = profileRes.rows[0].target_programme;
      }

      const assignRes = await client.query(
        `SELECT ad.*
         FROM public.programme_assessment_assignments paa
         JOIN public.assessment_definitions ad ON ad.id = paa.assessment_definition_id
         WHERE paa.programme_id = $1 
           AND paa.assessment_type = 'DIAGNOSTIC'
           AND paa.is_active = true
           AND ad.status = 'PUBLISHED'
         LIMIT 1`,
        [studentProgramme]
      );

      let definition = assignRes.rows[0];
      if (!definition) {
        const defRes = await client.query(
          `SELECT * FROM public.assessment_definitions 
           WHERE code = 'ENG-PROF-DIAG' AND status = 'PUBLISHED' LIMIT 1`
        );
        definition = defRes.rows[0];
      }

      if (!definition) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: 'NO_PUBLISHED_DIAGNOSTIC',
            message: 'No published diagnostic assessment found.',
          },
          { status: 404 }
        );
      }

      // 2. Check existing active attempt for candidate
      const activeRes = await client.query(
        `SELECT * FROM public.assessment_attempts 
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
          attemptId: active.id,
          resumed: true,
          startedAt: active.started_at,
          expiresAt: active.expires_at,
        });
      }

      // 3. Inventory Validation Check
      const grammarCountRes = await client.query(`
        SELECT count(DISTINCT q.id) as cnt
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL
      `);
      const grammarCount = parseInt(grammarCountRes.rows[0]?.cnt || '0', 10);

      const passageCountRes = await client.query(`
        SELECT count(*) as cnt FROM public.reading_passages WHERE status = 'published' OR status IS NOT NULL
      `);
      const passageCount = parseInt(passageCountRes.rows[0]?.cnt || '0', 10);

      const writingCountRes = await client.query(`
        SELECT count(*) as cnt FROM public.writing_tasks WHERE exam_type = 'English Proficiency' OR exam_type IS NOT NULL
      `);
      const writingCount = parseInt(writingCountRes.rows[0]?.cnt || '0', 10);

      if (grammarCount < 30 || passageCount < 1 || writingCount < 2) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          {
            success: false,
            error: 'DIAGNOSTIC_INSUFFICIENT_INVENTORY',
            code: 'INSUFFICIENT_DIAGNOSTIC_INVENTORY',
            message:
              'The diagnostic assessment is temporarily unavailable due to insufficient question inventory.',
            requirements: { grammar: 30, passages: 1, writing: 2 },
            available: { grammar: grammarCount, passages: passageCount, writing: writingCount },
          },
          { status: 422 }
        );
      }

      // 4. Generate & Freeze Immutable Paper Snapshot via QuestionSelectionService
      const generatedSnapshot = await QuestionSelectionService.generatePaperSnapshot(client, {
        studentId,
        examType: studentProgramme,
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

      // 5. Insert attempt record into canonical assessment_attempts table
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

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        attemptId: newAttempt.id,
        resumed: false,
        startedAt: newAttempt.started_at,
        expiresAt: newAttempt.expires_at,
      });
    } catch (innerErr: any) {
      await client.query('ROLLBACK');
      console.error('POST /api/v1/student/diagnostic/start transaction error:', innerErr);
      return NextResponse.json({ success: false, error: innerErr.message }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('POST /api/v1/student/diagnostic/start error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
