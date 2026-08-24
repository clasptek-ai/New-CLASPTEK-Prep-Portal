export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

export async function GET(_req: NextRequest) {
  try {
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const res = await pool.query(
      `SELECT id, exam_code, title, description, scoring_strategy, status, exam_type, version_no, sections_payload, created_at, updated_at
       FROM public.mock_blueprints
       ORDER BY created_at ASC`
    );

    return NextResponse.json({ success: true, data: res.rows }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const roles = (session?.roles || [req.headers.get('x-user-role') || '']).map((r) =>
      (r || '').toLowerCase()
    );

    // Verify Admin permission
    const isStaffOrAdmin = roles.some((r) =>
      ['admin', 'super_admin', 'staff', 'administrator'].includes(r)
    );
    if (!isStaffOrAdmin && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        {
          error: 'FORBIDDEN_ACTION',
          message: 'Only authorized administrators can lock or unlock mock examinations.',
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { blueprintId, status } = body;

    if (!blueprintId || !status) {
      return NextResponse.json({ error: 'Missing blueprintId or status' }, { status: 400 });
    }

    const normalizedStatus = ['PUBLISHED', 'APPROVED', 'ACTIVE', 'UNLOCKED'].includes(
      status.toUpperCase()
    )
      ? 'PUBLISHED'
      : ['LOCKED', 'ARCHIVED', 'DISABLED', 'UNPUBLISHED'].includes(status.toUpperCase())
        ? 'ARCHIVED'
        : ['DRAFT', 'UNDER_REVIEW'].includes(status.toUpperCase())
          ? status.toUpperCase()
          : 'ARCHIVED';

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const bpRes = await pool.query(
      `UPDATE public.mock_blueprints
       SET status = $1, updated_at = NOW()
       WHERE id::text = $2 OR exam_code = $2
       RETURNING *`,
      [normalizedStatus, blueprintId]
    );

    if (bpRes.rows.length === 0) {
      return NextResponse.json({ error: 'Mock Blueprint not found' }, { status: 404 });
    }

    // Also update matching template status (PUBLISHED or ARCHIVED)
    const tmplStatus = normalizedStatus === 'PUBLISHED' ? 'PUBLISHED' : 'ARCHIVED';
    await pool.query(
      `UPDATE public.mock_templates
       SET status = $1, updated_at = NOW()
       WHERE blueprint_id::text = $2 OR id::text = $2 OR code = $2`,
      [tmplStatus, blueprintId]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Mock Examination successfully ${normalizedStatus === 'PUBLISHED' ? 'UNLOCKED' : 'LOCKED'}.`,
        data: bpRes.rows[0],
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PATCH(req);
}
