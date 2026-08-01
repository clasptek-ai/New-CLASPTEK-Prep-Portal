export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = session?.tenantId || '00000000-0000-0000-0000-000000000000';

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Resolve student target programme & active assigned diagnostic definition
    let studentProgramme = 'English Proficiency';
    const profileRes = await pool.query(
      `SELECT target_programme FROM public.profiles WHERE user_id = $1 OR id = $1`,
      [studentId]
    ).catch(() => null);
    if (profileRes && profileRes.rows.length > 0 && profileRes.rows[0].target_programme) {
      studentProgramme = profileRes.rows[0].target_programme;
    }

    const assignRes = await pool.query(
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
      const defRes = await pool.query(
        `SELECT * FROM public.assessment_definitions 
         WHERE code = 'ENG-PROF-DIAG' AND status = 'PUBLISHED' LIMIT 1`
      );
      definition = defRes.rows[0];
    }

    if (!definition) {
      return NextResponse.json(
        { success: false, error: 'NO_PUBLISHED_DIAGNOSTIC', message: 'No published diagnostic assessment found.' },
        { status: 404 }
      );
    }

    // 2. Check existing active attempt for candidate
    const activeRes = await pool.query(
      `SELECT * FROM public.diagnostic_attempts 
       WHERE student_id = $1 
         AND status = 'IN_PROGRESS' 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND deleted_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [studentId]
    );

    if (activeRes.rows.length > 0) {
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
    const grammarCountRes = await pool.query(`
      SELECT count(DISTINCT q.id) as cnt
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
    `);
    const grammarCount = parseInt(grammarCountRes.rows[0]?.cnt || '0', 10);

    const passageCountRes = await pool.query(`
      SELECT count(*) as cnt FROM public.reading_passages WHERE status = 'published' OR status IS NOT NULL
    `);
    const passageCount = parseInt(passageCountRes.rows[0]?.cnt || '0', 10);

    const writingCountRes = await pool.query(`
      SELECT count(*) as cnt FROM public.writing_tasks WHERE exam_type = 'English Proficiency' OR exam_type IS NOT NULL
    `);
    const writingCount = parseInt(writingCountRes.rows[0]?.cnt || '0', 10);

    if (grammarCount < 30 || passageCount < 1 || writingCount < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'DIAGNOSTIC_INSUFFICIENT_INVENTORY',
          code: 'INSUFFICIENT_DIAGNOSTIC_INVENTORY',
          message: 'The diagnostic assessment is temporarily unavailable due to insufficient question inventory.',
          requirements: { grammar: 30, passages: 1, writing: 2 },
          available: { grammar: grammarCount, passages: passageCount, writing: writingCount },
        },
        { status: 422 }
      );
    }

    // 4. Generate & Freeze Immutable Paper Snapshot
    // Fetch 30 level-balanced Grammar questions
    const grammarRes = await pool.query(`
      WITH foundation_q AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'FOUNDATION') as proficiency_level, qv.payload
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL AND (qv.proficiency_level ILIKE 'FOUNDATION%' OR qv.proficiency_level ILIKE 'BASIC%' OR qv.proficiency_level ILIKE 'EASY%')
        LIMIT 10
      ),
      intermediate_q AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'INTERMEDIATE') as proficiency_level, qv.payload
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL AND (qv.proficiency_level ILIKE 'INTERMEDIATE%' OR qv.proficiency_level ILIKE 'MEDIUM%')
        LIMIT 10
      ),
      advanced_q AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'ADVANCED') as proficiency_level, qv.payload
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL AND (qv.proficiency_level ILIKE 'ADVANCED%' OR qv.proficiency_level ILIKE 'HARD%')
        LIMIT 10
      ),
      level_balanced AS (
        SELECT * FROM foundation_q UNION ALL SELECT * FROM intermediate_q UNION ALL SELECT * FROM advanced_q
      ),
      fallback_q AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'INTERMEDIATE') as proficiency_level, qv.payload
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL AND q.id NOT IN (SELECT question_id FROM level_balanced)
        LIMIT 30
      )
      SELECT question_id, code, version_id, prompt, proficiency_level, payload
      FROM (SELECT * FROM level_balanced UNION ALL SELECT * FROM fallback_q) combined_grammar
      LIMIT 30
    `);

    const qvIds = grammarRes.rows.map((r) => r.version_id);
    const optRes = qvIds.length > 0 ? await pool.query(
      `SELECT question_version_id, option_code, option_text
       FROM public.answer_options
       WHERE question_version_id = ANY($1::uuid[])
       ORDER BY display_order ASC`,
      [qvIds]
    ) : { rows: [] };

    const optionsByVersion = new Map<string, any[]>();
    optRes.rows.forEach((o) => {
      if (!optionsByVersion.has(o.question_version_id)) {
        optionsByVersion.set(o.question_version_id, []);
      }
      optionsByVersion.get(o.question_version_id)!.push({
        code: o.option_code || 'A',
        text: o.option_text,
      });
    });

    const grammarSnapshot = grammarRes.rows.map((r, i) => ({
      id: r.question_id,
      versionId: r.version_id,
      code: r.code || `ENG-GRAM-${(i + 1).toString().padStart(3, '0')}`,
      prompt: r.prompt,
      proficiencyLevel: r.proficiency_level || 'INTERMEDIATE',
      options: optionsByVersion.get(r.version_id) || [
        { code: 'A', text: 'Option A' },
        { code: 'B', text: 'Option B' },
        { code: 'C', text: 'Option C' },
        { code: 'D', text: 'Option D' },
      ],
    }));

    // Fetch Reading Passage
    const passageRes = await pool.query(`
      SELECT id, code, title, content
      FROM public.reading_passages
      WHERE status = 'published' OR status IS NOT NULL
      ORDER BY created_at DESC LIMIT 1
    `);
    const readingSnapshot = passageRes.rows[0] || null;

    // Fetch Writing Tasks
    const writingRes = await pool.query(`
      SELECT id, code, task_number, title, prompt, instructions, min_words
      FROM public.writing_tasks
      WHERE exam_type = 'English Proficiency' OR exam_type IS NOT NULL
      ORDER BY task_number ASC LIMIT 2
    `);
    const writingSnapshot = writingRes.rows;

    const paperSnapshot = {
      assessmentDefinitionId: definition.id,
      code: definition.code,
      title: definition.title,
      durationMinutes: definition.duration_minutes || 45,
      grammarQuestions: grammarSnapshot,
      readingPassage: readingSnapshot,
      writingTasks: writingSnapshot,
      frozenAt: new Date().toISOString(),
    };

    // 5. Create Diagnostic Attempt & Server Timer
    const attemptId = randomUUID();
    const catalogId = definition.id;
    const now = new Date();
    const durationMins = definition.duration_minutes || 45;
    const expiresAt = new Date(now.getTime() + durationMins * 60 * 1000);

    await pool.query(
      `INSERT INTO public.diagnostic_attempts (
        id, student_id, catalog_id, status, started_at, expires_at, duration_minutes, paper_snapshot, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, 'IN_PROGRESS', $4, $5, $6, $7, $8, $4, $4)`,
      [attemptId, studentId, catalogId, now.toISOString(), expiresAt.toISOString(), durationMins, JSON.stringify(paperSnapshot), tenantId]
    );

    return NextResponse.json(
      {
        success: true,
        attemptId,
        resumed: false,
        startedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/v1/student/diagnostic/start error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
