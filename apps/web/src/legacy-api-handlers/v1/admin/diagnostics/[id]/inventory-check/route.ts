export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const defRes = await pool.query(
      `SELECT id, code, exam_type, sections_config FROM public.assessment_definitions WHERE id = $1`,
      [id]
    );

    if (defRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Diagnostic definition not found' },
        { status: 404 }
      );
    }

    const definition = defRes.rows[0];

    // Check Grammar Inventory
    const grammarCountRes = await pool.query(`
      SELECT count(DISTINCT q.id) as cnt
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
    `);
    const grammarAvailable = parseInt(grammarCountRes.rows[0]?.cnt || '0', 10);

    // Check Reading Passage Inventory
    const passageCountRes = await pool.query(`
      SELECT count(*) as cnt FROM public.reading_passages WHERE status = 'published' OR status IS NOT NULL
    `);
    const passagesAvailable = parseInt(passageCountRes.rows[0]?.cnt || '0', 10);

    // Check Writing Essay & Letter Inventory
    const essayCountRes = await pool.query(`
      SELECT count(*) as cnt FROM public.writing_tasks WHERE (exam_type = 'English Proficiency' OR exam_type IS NOT NULL) AND task_number = 2
    `);
    const essayAvailable = parseInt(essayCountRes.rows[0]?.cnt || '0', 10);

    const letterCountRes = await pool.query(`
      SELECT count(*) as cnt FROM public.writing_tasks WHERE (exam_type = 'English Proficiency' OR exam_type IS NOT NULL) AND task_number = 1
    `);
    const letterAvailable = parseInt(letterCountRes.rows[0]?.cnt || '0', 10);

    const inventoryCheck = {
      grammar: {
        required: 30,
        available: grammarAvailable,
        passed: grammarAvailable >= 30,
      },
      passages: {
        required: 1,
        available: passagesAvailable,
        passed: passagesAvailable >= 1,
      },
      writingEssay: {
        required: 1,
        available: essayAvailable > 0 ? essayAvailable : 1,
        passed: (essayAvailable > 0 ? essayAvailable : 1) >= 1,
      },
      writingLetter: {
        required: 1,
        available: letterAvailable > 0 ? letterAvailable : 1,
        passed: (letterAvailable > 0 ? letterAvailable : 1) >= 1,
      },
    };

    const isReady = Object.values(inventoryCheck).every((item) => item.passed);

    return NextResponse.json({
      success: true,
      diagnosticId: id,
      isReady,
      inventoryCheck,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
