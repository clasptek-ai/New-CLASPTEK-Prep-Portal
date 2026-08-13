export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(_req: NextRequest) {
  try {
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const res = await pool.query(
      `SELECT 
        id, 
        code,
        title, 
        assessment_type as type, 
        exam_type as "examType",
        duration_minutes as "durationMinutes", 
        status
      FROM public.assessment_definitions
      WHERE status = 'PUBLISHED' OR status IS NOT NULL
      ORDER BY created_at ASC`
    );

    return NextResponse.json({ success: true, data: res.rows }, { status: 200 });
  } catch (err: unknown) {
    console.error('[GET_ADMIN_ASSESSMENTS_ERROR]', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve assessments.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
