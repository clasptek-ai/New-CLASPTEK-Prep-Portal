export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(req: NextRequest) {
  try {
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const res = await pool.query(`
      SELECT id, code, title, content, exam_type, section, source, word_count, created_at
      FROM public.reading_passages
      ORDER BY created_at DESC
    `);

    const passages = res.rows.map((row) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      content: row.content,
      examType: row.exam_type,
      section: row.section || 'Reading',
      source: row.source || 'Clasptek Bank',
      wordCount: row.word_count || 0,
      questionIds: [],
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, data: passages });
  } catch (err: any) {
    console.error('GET /api/v1/admin/passages error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
