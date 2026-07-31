export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id') || '00000000-0000-0000-0000-000000000001';

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

    // Fetch 30 Grammar Questions from PostgreSQL
    const grammarRes = await pool.query(`
      SELECT 
        q.id as question_id,
        q.code,
        qv.id as version_id,
        qv.prompt,
        qv.proficiency_level,
        qv.grammar_topic,
        qv.payload
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
      ORDER BY q.created_at DESC
      LIMIT 30
    `);

    const qvIds = grammarRes.rows.map((r) => r.version_id);
    const optRes = await pool.query(
      `SELECT question_version_id, option_code, option_text, is_correct
       FROM public.answer_options
       WHERE question_version_id = ANY($1::uuid[])
       ORDER BY display_order ASC`,
      [qvIds]
    );

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
      WHERE deleted_at IS NULL
      LIMIT 1
    `);
    const readingPassage = passageRes.rows[0] || null;

    // Fetch Writing Tasks
    const writingRes = await pool.query(`
      SELECT id, code, task_number, title, prompt, instructions, min_words
      FROM public.writing_tasks
      WHERE exam_type = 'English Proficiency'
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
