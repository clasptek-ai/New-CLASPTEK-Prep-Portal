export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { PostgresCanonicalMockRepository } from '@clasptek/persistence';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('exam') || searchParams.get('examType') || undefined;

    const { dbPool } = await getDiagnosticContext();
    const mockRepo = new PostgresCanonicalMockRepository(dbPool.getPool());

    const pool = dbPool.getPool();
    let query = `SELECT * FROM public.mock_blueprints WHERE status = 'PUBLISHED' OR status = 'APPROVED'`;
    const params: any[] = [];

    if (examType) {
      params.push(`%${examType}%`);
      query += ` AND (exam_type ILIKE $1 OR exam_code ILIKE $1)`;
    }

    query += ` ORDER BY created_at DESC`;

    const res = await pool.query(query, params);

    const blueprintsWithValidation = await Promise.all(
      res.rows.map(async (row) => {
        const sections = Array.isArray(row.sections_payload) ? row.sections_payload : [];
        const bpRecord = {
          id: row.id,
          examCode: row.exam_code,
          examType: row.exam_type || 'IELTS Academic',
          title: row.title,
          description: row.description || '',
          scoringStrategy: row.scoring_strategy || 'CUSTOM',
          status: row.status,
          versionNo: row.version_no || 1,
          sections,
        };

        const validation = await mockRepo.validateBlueprintInventory(bpRecord);

        return {
          id: row.id,
          examCode: row.exam_code,
          examType: row.exam_type,
          title: row.title,
          description: row.description,
          scoringStrategy: row.scoring_strategy,
          status: row.status,
          versionNo: row.version_no,
          sections,
          inventoryStatus: validation.isValid ? 'READY' : 'INSUFFICIENT_INVENTORY',
          inventoryDeficits: validation.deficits,
        };
      })
    );

    return NextResponse.json({
      success: true,
      blueprints: blueprintsWithValidation,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
