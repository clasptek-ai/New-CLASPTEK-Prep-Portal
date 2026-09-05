export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/assessment-attempts
 * Admin Endpoint: Query student assessment attempts with search & filters
 * Supports both Diagnostic Pre-Assessments and Official Mock Examinations.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);

    // Verify Admin or Staff role
    const isStaff = session?.roles?.some((r) =>
      ['SUPER_ADMIN', 'ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'STAFF'].includes(r.toUpperCase())
    );

    if (!isStaff && process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = new URL(req.url).searchParams;
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const cefr = searchParams.get('cefr')?.trim() || '';
    const studentId =
      searchParams.get('studentId')?.trim() || searchParams.get('userId')?.trim() || '';
    const assessmentType = (searchParams.get('type') || 'ALL').toUpperCase();

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    const allAttempts: any[] = [];

    // ─── 1. Query Diagnostic Assessment Attempts ──────────────────────
    if (assessmentType === 'ALL' || assessmentType === 'DIAGNOSTIC') {
      let diagQuery = `
        SELECT 
          aa.id as attempt_id,
          aa.student_id,
          aa.catalog_id,
          aa.status as attempt_status,
          aa.started_at,
          aa.closed_at,
          aa.score,
          COALESCE(au.email, 'student@clasptek.ai') as student_email,
          COALESCE(NULLIF(TRIM(CONCAT(p.first_name, ' ', p.last_name)), ''), au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1), 'Candidate') as student_name,
          ar.cefr_level,
          ar.predicted_band,
          ar.placement_level,
          ar.recommended_course,
          ar.recommended_duration,
          'DIAGNOSTIC' as assessment_type
        FROM public.assessment_attempts aa
        LEFT JOIN auth.users au ON au.id = aa.student_id
        LEFT JOIN public.profiles p ON p.user_id = aa.student_id OR p.id = aa.student_id
        LEFT JOIN public.assessment_results ar ON ar.attempt_id = aa.id
        WHERE aa.deleted_at IS NULL
      `;

      const diagParams: any[] = [];

      if (studentId) {
        diagParams.push(studentId);
        diagQuery += ` AND aa.student_id = $${diagParams.length}`;
      }

      if (status) {
        diagParams.push(status);
        diagQuery += ` AND aa.status = $${diagParams.length}`;
      }

      if (cefr) {
        diagParams.push(cefr);
        diagQuery += ` AND ar.cefr_level = $${diagParams.length}`;
      }

      if (search) {
        diagParams.push(`%${search}%`);
        diagQuery += ` AND (p.first_name ILIKE $${diagParams.length} OR p.last_name ILIKE $${diagParams.length} OR au.email ILIKE $${diagParams.length} OR aa.id::text ILIKE $${diagParams.length})`;
      }

      diagQuery += ` ORDER BY aa.started_at DESC LIMIT 50`;

      const diagRes = await pool.query(diagQuery, diagParams);
      diagRes.rows.forEach((row) => {
        allAttempts.push({
          attemptId: row.attempt_id,
          studentId: row.student_id,
          studentName: row.student_name || 'Candidate',
          studentEmail: row.student_email || 'student@clasptek.ai',
          catalogId: row.catalog_id,
          assessmentType: 'DIAGNOSTIC',
          status: row.attempt_status,
          score: row.score ? parseFloat(row.score) : 0,
          cefrLevel: row.cefr_level || null,
          predictedBand: row.predicted_band || null,
          placementLevel: row.placement_level || 'FOUNDATION',
          recommendedCourse: row.recommended_course || 'English Proficiency Core',
          recommendedDuration: row.recommended_duration || '5 Weeks',
          startedAt: row.started_at,
          submittedAt: row.closed_at,
        });
      });
    }

    // ─── 2. Query Mock Examination Sessions ──────────────────────────
    if (assessmentType === 'ALL' || assessmentType === 'MOCK') {
      let mockQuery = `
        SELECT 
          ms.id as attempt_id,
          ms.student_id,
          ms.template_id as catalog_id,
          ms.status as attempt_status,
          ms.started_at,
          ms.submitted_at as closed_at,
          COALESCE(ms.official_scaled_score, ms.score_percentage, 0) as score,
          COALESCE(au.email, 'student@clasptek.ai') as student_email,
          COALESCE(NULLIF(TRIM(CONCAT(p.first_name, ' ', p.last_name)), ''), au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1), 'Candidate') as student_name,
          CASE WHEN COALESCE(mr.official_scaled_score, ms.official_scaled_score, 0) >= 7.5 THEN 'C1' WHEN COALESCE(mr.official_scaled_score, ms.official_scaled_score, 0) >= 5.5 THEN 'B2' ELSE 'B1' END as cefr_level,
          COALESCE(mr.official_score_label, ms.official_score_label, 'Pending Evaluation') as predicted_band,
          'OFFICIAL_MOCK' as placement_level,
          'IELTS Academic Official Mock' as recommended_course,
          '165 Minutes' as recommended_duration,
          'MOCK' as assessment_type
        FROM public.mock_sessions ms
        LEFT JOIN auth.users au ON au.id::text = ms.student_id::text
        LEFT JOIN public.profiles p ON (p.user_id = ms.student_id OR p.id = ms.student_id)
        LEFT JOIN public.mock_results mr ON mr.session_id = ms.id
        WHERE ms.status IS NOT NULL
      `;

      const mockParams: any[] = [];

      if (studentId) {
        mockParams.push(studentId);
        mockQuery += ` AND ms.student_id = $${mockParams.length}`;
      }

      if (status) {
        mockParams.push(status);
        mockQuery += ` AND ms.status = $${mockParams.length}`;
      }

      if (search) {
        mockParams.push(`%${search}%`);
        mockQuery += ` AND (p.first_name ILIKE $${mockParams.length} OR p.last_name ILIKE $${mockParams.length} OR au.email ILIKE $${mockParams.length} OR ms.id::text ILIKE $${mockParams.length})`;
      }

      mockQuery += ` ORDER BY ms.started_at DESC NULLS LAST, ms.created_at DESC LIMIT 50`;

      const mockRes = await pool.query(mockQuery, mockParams);
      mockRes.rows.forEach((row) => {
        allAttempts.push({
          attemptId: row.attempt_id,
          studentId: row.student_id,
          studentName: row.student_name || 'Candidate',
          studentEmail: row.student_email || 'student@clasptek.ai',
          catalogId: row.catalog_id,
          assessmentType: 'MOCK',
          status: row.attempt_status,
          score: row.score ? parseFloat(row.score) : 0,
          cefrLevel: row.cefr_level || (row.score >= 7.5 ? 'C1' : row.score >= 5.5 ? 'B2' : 'B1'),
          predictedBand: row.predicted_band || 'Pending Evaluation',
          placementLevel: 'OFFICIAL_MOCK',
          recommendedCourse: 'IELTS Academic Official Mock',
          recommendedDuration: '165 Minutes',
          startedAt: row.started_at,
          submittedAt: row.closed_at,
        });
      });
    }

    // Sort combined attempts by startedAt DESC
    allAttempts.sort((a, b) => {
      const timeA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const timeB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      totalAttempts: allAttempts.length,
      attempts: allAttempts,
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/assessment-attempts error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
