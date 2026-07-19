import { NextRequest, NextResponse } from 'next/server';
import { getCurriculumContext } from '@/lib/curriculum-context';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { dbPool, logger } = await getCurriculumContext();
  try {
    const resolvedParams = await params;
    const moduleId = resolvedParams.id;
    const pool = dbPool.getPool();

    const res = await pool.query('SELECT * FROM modules WHERE id = $1 AND deleted_at IS NULL', [moduleId]);
    if (res.rows.length === 0) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Module not found' }, { status: 404 });
    }

    const row = res.rows[0];

    // Fetch competencies under this module
    const compRes = await pool.query('SELECT * FROM competencies WHERE module_id = $1 AND deleted_at IS NULL ORDER BY display_order ASC', [moduleId]);
    const competencies = compRes.rows.map(cp => ({
      id: cp.id,
      code: cp.code,
      name: cp.name,
      description: cp.description,
      displayOrder: cp.display_order
    }));

    return NextResponse.json({
      id: row.id,
      subjectId: row.subject_id,
      name: row.name,
      description: row.description,
      displayOrder: row.display_order,
      competencies
    }, { status: 200 });
  } catch (err: unknown) {
    logger.error('GET /api/v1/modules/[id] failure', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
