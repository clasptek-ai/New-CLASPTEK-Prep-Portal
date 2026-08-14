export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(_req: NextRequest) {
  try {
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const passagesRes = await pool.query(`
      SELECT id, code, title, content, exam_type, section, source, word_count, created_at
      FROM public.reading_passages
      ORDER BY created_at DESC
    `);

    const qRes = await pool.query(`
      SELECT q.id as question_id, q.code, qv.payload
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
    `);

    const questionsByPassageCode = new Map<string, string[]>();
    const questionsByPassageId = new Map<string, string[]>();

    qRes.rows.forEach((r) => {
      const payload = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload || {};
      const pCode = payload.passageCode;
      const pId = payload.passageId || payload.passage_id;

      if (pCode) {
        if (!questionsByPassageCode.has(pCode)) questionsByPassageCode.set(pCode, []);
        questionsByPassageCode.get(pCode)!.push(r.question_id);
      }
      if (pId) {
        if (!questionsByPassageId.has(pId)) questionsByPassageId.set(pId, []);
        questionsByPassageId.get(pId)!.push(r.question_id);
      }
    });

    const passages = passagesRes.rows.map((row) => {
      const idsFromCode = questionsByPassageCode.get(row.code) || [];
      const idsFromId = questionsByPassageId.get(row.id) || [];
      const combinedIds = Array.from(new Set([...idsFromCode, ...idsFromId]));

      return {
        id: row.id,
        code: row.code,
        title: row.title,
        content: row.content,
        examType: row.exam_type,
        section: row.section || 'Reading',
        source: row.source || 'Clasptek Bank',
        wordCount:
          row.word_count || (row.content ? row.content.split(/\s+/).filter(Boolean).length : 0),
        questionIds: combinedIds,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({ success: true, data: passages });
  } catch (err: any) {
    console.error('GET /api/v1/admin/passages error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
