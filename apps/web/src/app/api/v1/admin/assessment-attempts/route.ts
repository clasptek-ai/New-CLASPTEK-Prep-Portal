export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/assessment-attempts
 * Admin Endpoint: Query student assessment attempts with search & filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);

    // Verify Admin or Staff role
    const isStaff = session?.roles?.some((r) =>
      ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const cefr = searchParams.get('cefr')?.trim() || '';

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    let query = `
      SELECT 
        aa.id as attempt_id,
        aa.student_id,
        aa.catalog_id,
        aa.status as attempt_status,
        aa.started_at,
        aa.closed_at,
        aa.score,
        p.email as student_email,
        p.full_name as student_name,
        ar.cefr_level,
        ar.predicted_band,
        ar.placement_level,
        ar.recommended_course,
        ar.recommended_duration
      FROM public.assessment_attempts aa
      LEFT JOIN public.profiles p ON p.user_id = aa.student_id OR p.id = aa.student_id
      LEFT JOIN public.assessment_results ar ON ar.attempt_id = aa.id
      WHERE aa.deleted_at IS NULL
    `;

    const paramsList: any[] = [];

    if (status) {
      paramsList.push(status);
      query += ` AND aa.status = $${paramsList.length}`;
    }

    if (cefr) {
      paramsList.push(cefr);
      query += ` AND ar.cefr_level = $${paramsList.length}`;
    }

    if (search) {
      paramsList.push(`%${search}%`);
      query += ` AND (p.full_name ILIKE $${paramsList.length} OR p.email ILIKE $${paramsList.length} OR aa.id::text ILIKE $${paramsList.length})`;
    }

    query += ` ORDER BY aa.started_at DESC LIMIT 100`;

    const attemptsRes = await pool.query(query, paramsList);

    const attempts = attemptsRes.rows.map((row) => ({
      attemptId: row.attempt_id,
      studentId: row.student_id,
      studentName: row.student_name || 'Candidate',
      studentEmail: row.student_email || 'student@clasptek.ai',
      catalogId: row.catalog_id,
      status: row.attempt_status,
      score: row.score ? parseFloat(row.score) : 0,
      cefrLevel: row.cefr_level || 'B1',
      predictedBand: row.predicted_band || 'Band 6.5',
      placementLevel: row.placement_level || 'FOUNDATION',
      recommendedCourse: row.recommended_course || 'English Proficiency Core',
      recommendedDuration: row.recommended_duration || '5 Weeks',
      startedAt: row.started_at,
      submittedAt: row.closed_at,
    }));

    return NextResponse.json({
      success: true,
      totalAttempts: attempts.length,
      attempts,
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/assessment-attempts error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
