export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const studentId = session?.userId || req.headers.get('x-student-id') || '00000000-0000-0000-0000-000000000001';

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const activeRes = await pool.query(
      `SELECT * FROM public.diagnostic_attempts 
       WHERE student_id = $1 
         AND status = 'IN_PROGRESS' 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND deleted_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [studentId]
    );

    if (activeRes.rows.length > 0) {
      const active = activeRes.rows[0];
      return NextResponse.json({
        success: true,
        hasActiveAttempt: true,
        attempt: {
          id: active.id,
          status: active.status,
          startedAt: active.started_at,
          expiresAt: active.expires_at,
        },
      });
    }

    return NextResponse.json({
      success: true,
      hasActiveAttempt: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const body = await req.json().catch(() => ({}));
    const studentId = session?.userId || req.headers.get('x-student-id') || '00000000-0000-0000-0000-000000000001';
    const tenantId = session?.tenantId || '00000000-0000-0000-0000-000000000000';

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Database Inventory Pre-Check
    const grammarCountRes = await pool.query(`
      SELECT count(DISTINCT q.id) as cnt
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id
      WHERE q.deleted_at IS NULL
    `);
    const grammarCount = parseInt(grammarCountRes.rows[0]?.cnt || '0', 10);

    const passageCountRes = await pool.query(`
      SELECT count(*) as cnt FROM public.reading_passages WHERE deleted_at IS NULL
    `);
    const passageCount = parseInt(passageCountRes.rows[0]?.cnt || '0', 10);

    const writingCountRes = await pool.query(`
      SELECT count(*) as cnt FROM public.writing_tasks WHERE exam_type = 'English Proficiency'
    `);
    const writingCount = parseInt(writingCountRes.rows[0]?.cnt || '0', 10);

    if (grammarCount < 30 || passageCount < 1 || writingCount < 2) {
      return NextResponse.json(
        {
          error: 'DIAGNOSTIC_INSUFFICIENT_INVENTORY',
          message: 'The diagnostic assessment is temporarily unavailable. Please contact your administrator.',
          details: { grammarAvailable: grammarCount, passagesAvailable: passageCount, writingAvailable: writingCount },
        },
        { status: 422 }
      );
    }

    // 2. Check existing active attempt for student
    const activeRes = await pool.query(
      `SELECT * FROM public.diagnostic_attempts 
       WHERE student_id = $1 
         AND status = 'IN_PROGRESS' 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND deleted_at IS NULL
       ORDER BY started_at DESC LIMIT 1`,
      [studentId]
    );

    if (activeRes.rows.length > 0) {
      const active = activeRes.rows[0];
      return NextResponse.json({
        success: true,
        attemptId: active.id,
        resumed: true,
        startedAt: active.started_at,
        expiresAt: active.expires_at,
      });
    }

    // 3. Create new 45-minute Diagnostic Attempt
    const attemptId = randomUUID();
    const catalogId = body.catalogId || 'd0000000-0000-0000-0000-000000000001';
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 45 * 60 * 1000);

    await pool.query(
      `INSERT INTO public.diagnostic_attempts (
        id, student_id, catalog_id, status, started_at, expires_at, duration_minutes, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, 'IN_PROGRESS', $4, $5, 45, $6, $4, $4)`,
      [attemptId, studentId, catalogId, now.toISOString(), expiresAt.toISOString(), tenantId]
    );

    return NextResponse.json(
      {
        success: true,
        attemptId,
        resumed: false,
        startedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/v1/diagnostic/attempts error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
