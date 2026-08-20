export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(_req: NextRequest) {
  try {
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const passagesRes = await pool.query(`
      SELECT id, code, title, content, exam_type, section, source, word_count, created_at, updated_at
      FROM public.reading_passages
      ORDER BY code ASC, created_at ASC
    `);

    // Fetch Question Groups for each passage
    const groupsRes = await pool.query(`
      SELECT id, code, passage_id, title, instructions, question_type, content_title, content_type, shared_data, display_order
      FROM public.question_groups
      ORDER BY display_order ASC
    `);

    const groupsByPassageId = new Map<string, any[]>();
    groupsRes.rows.forEach((g) => {
      if (g.passage_id) {
        if (!groupsByPassageId.has(g.passage_id)) groupsByPassageId.set(g.passage_id, []);
        groupsByPassageId.get(g.passage_id)!.push({
          id: g.id,
          code: g.code,
          title: g.title,
          instructions: g.instructions,
          questionType: g.question_type,
          contentTitle: g.content_title,
          contentType: g.content_type,
          sharedData:
            typeof g.shared_data === 'string' ? JSON.parse(g.shared_data) : g.shared_data || {},
          displayOrder: g.display_order,
        });
      }
    });

    const qRes = await pool.query(`
      SELECT q.id as question_id, q.code, q.status, qv.prompt, qv.payload,
             (SELECT json_agg(json_build_object('code', ao.option_code, 'text', ao.option_text, 'is_correct', ao.is_correct))
              FROM public.answer_options ao WHERE ao.question_version_id = qv.id) as options
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
      ORDER BY q.code ASC
    `);

    const questionsByPassageCode = new Map<string, any[]>();
    const questionsByPassageId = new Map<string, any[]>();

    qRes.rows.forEach((r) => {
      const payload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload || {};
      const pCode = payload.passageCode;
      const pId = payload.passageId || payload.passage_id;

      const qItem = {
        id: r.question_id,
        code: r.code,
        prompt: r.prompt,
        type: payload.type || 'MCQ',
        difficulty: payload.difficulty || 'INTERMEDIATE',
        correctAnswer:
          payload.correctAnswer || r.options?.find((o: any) => o.is_correct)?.text || '',
        acceptedAnswers: payload.acceptedAnswers || [],
        groupCode: payload.groupCode,
        usages: payload.usages || ['PRACTICE'],
        options: r.options || [],
      };

      if (pCode) {
        if (!questionsByPassageCode.has(pCode)) questionsByPassageCode.set(pCode, []);
        questionsByPassageCode.get(pCode)!.push(qItem);
      }
      if (pId) {
        if (!questionsByPassageId.has(pId)) questionsByPassageId.set(pId, []);
        questionsByPassageId.get(pId)!.push(qItem);
      }
    });

    const passages = passagesRes.rows.map((row) => {
      const qsFromCode = questionsByPassageCode.get(row.code) || [];
      const qsFromId = questionsByPassageId.get(row.id) || [];
      const seen = new Set<string>();
      const combinedQuestions: any[] = [];

      [...qsFromCode, ...qsFromId].forEach((q) => {
        if (!seen.has(q.id)) {
          seen.add(q.id);
          combinedQuestions.push(q);
        }
      });

      const groups = groupsByPassageId.get(row.id) || [];

      return {
        id: row.id,
        code: row.code,
        title: row.title,
        content: row.content,
        examType: row.exam_type,
        section: row.section || 'Reading',
        source: row.source || 'Clasptek Question Bank',
        wordCount:
          row.word_count ||
          (row.content ? row.content.trim().split(/\s+/).filter(Boolean).length : 0),
        questionIds: combinedQuestions.map((q) => q.id),
        questions: combinedQuestions,
        groups,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return NextResponse.json({ success: true, data: passages });
  } catch (err: any) {
    console.error('GET /api/v1/admin/passages error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const code = body.code || `PAS-${Date.now().toString().slice(-6)}`;
    const title = body.title || 'Untitled Passage';
    const content = body.content || '';
    const examType = body.examType || 'IELTS Academic';
    const section = body.section || 'Reading';
    const source = body.source || 'Clasptek Question Bank';
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const res = await pool.query(
      `INSERT INTO public.reading_passages
       (id, code, title, content, exam_type, section, source, word_count, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'published', now(), now())
       ON CONFLICT (code) DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         word_count = EXCLUDED.word_count,
         updated_at = now()
       RETURNING id, code, title`,
      [code, title, content, examType, section, source, wordCount]
    );

    return NextResponse.json({ success: true, passage: res.rows[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const id = body.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Passage ID is required' },
        { status: 400 }
      );
    }

    const title = body.title;
    const content = body.content;
    const source = body.source;
    const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : undefined;

    const res = await pool.query(
      `UPDATE public.reading_passages SET
         title = COALESCE($1, title),
         content = COALESCE($2, content),
         source = COALESCE($3, source),
         word_count = COALESCE($4, word_count),
         updated_at = now()
       WHERE id = $5
       RETURNING id, code, title, content, word_count, updated_at`,
      [title, content, source, wordCount, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Passage not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, passage: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
