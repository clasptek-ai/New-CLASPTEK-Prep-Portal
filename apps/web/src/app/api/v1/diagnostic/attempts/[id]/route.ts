export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || (process.env.NODE_ENV === 'test' ? req.headers.get('x-student-id') : null);
    if (!studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: attemptId } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const attemptRes = await pool.query(
      'SELECT * FROM public.diagnostic_attempts WHERE id = $1 AND student_id = $2 AND deleted_at IS NULL',
      [attemptId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    const attempt = attemptRes.rows[0];

    // Fetch saved answers
    const responsesRes = await pool.query(
      'SELECT question_id, question_version_id, response_payload, time_spent_ms, is_correct FROM public.diagnostic_responses WHERE attempt_id = $1',
      [attemptId]
    );

    const savedAnswers: Record<string, any> = {};
    responsesRes.rows.forEach((r) => {
      savedAnswers[r.question_id] = r.response_payload;
    });

    // Fetch 30 Grammar Questions from PostgreSQL with balanced proficiency distribution (Foundation, Intermediate, Advanced)
    const grammarRes = await pool.query(`
      WITH foundation_q AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'FOUNDATION') as proficiency_level, qv.grammar_topic, qv.payload, 1 as pref
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL AND (qv.proficiency_level ILIKE 'FOUNDATION%' OR qv.proficiency_level ILIKE 'BASIC%' OR qv.proficiency_level ILIKE 'EASY%')
        LIMIT 10
      ),
      intermediate_q AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'INTERMEDIATE') as proficiency_level, qv.grammar_topic, qv.payload, 2 as pref
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL AND (qv.proficiency_level ILIKE 'INTERMEDIATE%' OR qv.proficiency_level ILIKE 'MEDIUM%')
        LIMIT 10
      ),
      advanced_q AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'ADVANCED') as proficiency_level, qv.grammar_topic, qv.payload, 3 as pref
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL AND (qv.proficiency_level ILIKE 'ADVANCED%' OR qv.proficiency_level ILIKE 'HARD%')
        LIMIT 10
      ),
      level_balanced AS (
        SELECT * FROM foundation_q
        UNION ALL
        SELECT * FROM intermediate_q
        UNION ALL
        SELECT * FROM advanced_q
      ),
      general_fallback AS (
        SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt,
               COALESCE(qv.proficiency_level, 'INTERMEDIATE') as proficiency_level, qv.grammar_topic, qv.payload, 4 as pref
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id
        WHERE q.deleted_at IS NULL
          AND q.id NOT IN (SELECT question_id FROM level_balanced)
        LIMIT 30
      )
      SELECT question_id, code, version_id, prompt, proficiency_level, grammar_topic, payload
      FROM (
        SELECT * FROM level_balanced
        UNION ALL
        SELECT * FROM general_fallback
      ) combined_grammar
      LIMIT 30
    `);

    const qvIds = grammarRes.rows.map((r) => r.version_id);
    const optRes = qvIds.length > 0 ? await pool.query(
      `SELECT question_version_id, option_code, option_text, is_correct
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

    const grammarQuestions = grammarRes.rows.map((r, i) => {
      const opts = optionsByVersion.get(r.version_id) || [];
      return {
        id: r.question_id,
        versionId: r.version_id,
        code: r.code || `ENG-GRAM-${(i + 1).toString().padStart(3, '0')}`,
        prompt: r.prompt,
        itemType: 'MCQ' as const,
        proficiencyLevel: r.proficiency_level || 'INTERMEDIATE',
        options: opts.length > 0 ? opts : [
          { code: 'A', text: 'Option A' },
          { code: 'B', text: 'Option B' },
          { code: 'C', text: 'Option C' },
          { code: 'D', text: 'Option D' },
        ],
        sectionCode: 'GRAMMAR',
      };
    });

    // Fetch Reading Passage
    const passageRes = await pool.query(`
      SELECT id, code, title, content
      FROM public.reading_passages
      WHERE status = 'published' OR status IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const readingPassage = passageRes.rows[0] || null;

    // Fetch Writing Tasks (1 Essay + 1 Letter)
    const writingRes = await pool.query(`
      SELECT id, code, task_number, title, prompt, instructions, min_words
      FROM public.writing_tasks
      WHERE exam_type = 'English Proficiency' OR exam_type IS NOT NULL
      ORDER BY task_number ASC
      LIMIT 2
    `);
    const writingTasks = writingRes.rows;

    const startedAt = attempt.started_at || new Date();
    const expiresAt = attempt.expires_at || new Date(new Date(startedAt).getTime() + 45 * 60 * 1000);
    const remainingSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        studentId: attempt.student_id,
        catalogId: attempt.catalog_id,
        status: attempt.status,
        startedAt,
        expiresAt,
        durationMinutes: 45,
        remainingSeconds,
        score: attempt.score,
      },
      content: {
        grammarQuestions,
        readingPassage,
        writingTasks,
      },
      savedAnswers,
      responseCount: responsesRes.rows.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
