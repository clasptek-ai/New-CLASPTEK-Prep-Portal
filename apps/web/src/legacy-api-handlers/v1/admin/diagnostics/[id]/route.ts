export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const res = await pool.query(
      `SELECT 
        ad.id,
        ad.code,
        ad.title,
        ad.exam_type as "examType",
        ad.assessment_type as "assessmentType",
        ad.duration_minutes as "durationMinutes",
        ad.status,
        ad.instructions,
        ad.sections_config as "sectionsConfig",
        ad.published_at as "publishedAt",
        paa.programme_id as "assignedProgramme"
      FROM public.assessment_definitions ad
      LEFT JOIN public.programme_assessment_assignments paa 
        ON paa.assessment_definition_id = ad.id AND paa.is_active = true
      WHERE ad.id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Diagnostic definition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, durationMinutes, status, instructions, sectionsConfig, assignedProgramme } =
      body;

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // If publishing, perform pre-publish inventory check first!
    if (status === 'PUBLISHED') {
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
            error: 'INVENTORY_VALIDATION_FAILED',
            message:
              'Cannot publish diagnostic assessment: Question bank inventory requirement check failed.',
            inventory: {
              grammar: { required: 30, available: grammarCount, valid: grammarCount >= 30 },
              passages: { required: 1, available: passageCount, valid: passageCount >= 1 },
              writing: { required: 2, available: writingCount, valid: writingCount >= 2 },
            },
          },
          { status: 422 }
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (title !== undefined) {
      updates.push(`title = $${idx++}`);
      values.push(title);
    }
    if (durationMinutes !== undefined) {
      updates.push(`duration_minutes = $${idx++}`);
      values.push(Number(durationMinutes));
    }
    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
      if (status === 'PUBLISHED') {
        updates.push(`published_at = NOW()`);
      }
    }
    if (instructions !== undefined) {
      updates.push(`instructions = $${idx++}`);
      values.push(instructions);
    }
    if (sectionsConfig !== undefined) {
      updates.push(`sections_config = $${idx++}`);
      values.push(JSON.stringify(sectionsConfig));
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    if (updates.length > 1) {
      await pool.query(
        `UPDATE public.assessment_definitions SET ${updates.join(', ')} WHERE id = $${idx}`,
        values
      );
    }

    if (assignedProgramme) {
      await pool.query(
        `INSERT INTO public.programme_assessment_assignments (
          programme_id, assessment_definition_id, assessment_type, is_active
        ) VALUES ($1, $2, 'DIAGNOSTIC', true)
        ON CONFLICT (programme_id, assessment_type, is_active) 
        DO UPDATE SET assessment_definition_id = EXCLUDED.assessment_definition_id, assigned_at = NOW()`,
        [assignedProgramme, id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnostic definition updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    await pool.query(
      `UPDATE public.assessment_definitions SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Diagnostic assessment archived successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
