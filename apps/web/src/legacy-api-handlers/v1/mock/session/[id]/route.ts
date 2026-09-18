export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const res = await pool.query(
      `SELECT id, student_id, exam_type, status, evaluation_state, 
              current_section_index, time_remaining_seconds, started_at, expires_at, 
              submitted_at, official_score_label
       FROM public.mock_sessions 
       WHERE id = $1 
       LIMIT 1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: 'MOCK_SESSION_NOT_FOUND', message: 'Mock session not found.' },
        { status: 404 }
      );
    }

    const row = res.rows[0];
    const expiresAtMs = row.expires_at ? new Date(row.expires_at).getTime() : null;
    const now = Date.now();
    const isExpired = expiresAtMs ? now >= expiresAtMs : false;
    const timeRemainingSeconds = expiresAtMs
      ? Math.max(0, Math.ceil((expiresAtMs - now) / 1000))
      : (row.time_remaining_seconds || 0);

    return NextResponse.json(
      {
        success: true,
        sessionId: row.id,
        exam: row.exam_type,
        status: row.status,
        evaluationState: row.evaluation_state,
        currentSectionIndex: row.current_section_index || 0,
        startedAt: row.started_at,
        expiresAt: row.expires_at,
        timeRemainingSeconds,
        isExpired,
        submittedAt: row.submitted_at,
        officialScoreLabel: row.official_score_label,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('GET /api/v1/mock/session/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
