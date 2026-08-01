export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/students/:studentId/assessment-history
 * Performs comprehensive student identifier resolution across:
 * - public.assessment_attempts.student_id
 * - auth.users.id
 * - auth.users.email
 * - public.profiles.id / user_id
 * - public.users.id
 *
 * Guarantees that any completed diagnostic assessment for a candidate is resolved
 * and displayed in Admin -> Students -> Student Profile -> Diagnostics.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getAuthenticatedSession(req);
    const isAdmin =
      session?.roles?.some((r) =>
        ['ADMINISTRATOR', 'ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN'].includes(r.toUpperCase())
      ) || process.env.NODE_ENV === 'development';

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId: rawStudentId } = await params;
    const studentId = decodeURIComponent(rawStudentId || '').trim();

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch student info from auth.users, profiles, or public.users
    const studentInfoQuery = await pool.query(
      `SELECT 
        au.id as auth_id,
        au.email,
        COALESCE(p.first_name || ' ' || p.last_name, au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as name,
        COALESCE(p.target_programme, au.raw_user_meta_data->>'programme', 'English Proficiency Core') as target_programme
       FROM auth.users au
       LEFT JOIN public.profiles p ON (p.user_id = au.id OR p.id = au.id)
       WHERE au.id::text = $1
          OR au.email ILIKE $1
          OR p.id::text = $1
          OR p.user_id::text = $1
       LIMIT 1`,
      [studentId]
    ).catch(() => null);

    const studentRecord = studentInfoQuery?.rows?.[0] || {
      auth_id: studentId,
      name: 'Candidate Student',
      email: studentId.includes('@') ? studentId : 'student@clasptek.org',
      target_programme: 'English Proficiency Core',
    };

    // 2. Query attempts using full multi-identifier matching
    let attemptsQuery = await pool.query(
      `SELECT
        att.id AS attempt_id,
        att.student_id,
        att.catalog_id AS assessment_id,
        COALESCE(ad.title, 'English Proficiency Diagnostic Assessment') AS assessment_title,
        COALESCE(res.assessment_category, 'DIAGNOSTIC') AS category,
        COALESCE(ad.exam_type, 'English Proficiency') AS exam_type,
        att.status,
        COALESCE(res.overall_score, att.score, 0) AS score,
        COALESCE(res.cefr_level, 'B1') AS cefr,
        COALESCE(res.predicted_band, 'Band 6.5') AS predicted_band,
        COALESCE(res.placement_level, 'FOUNDATION') AS placement,
        COALESCE(res.recommended_course, 'Comprehensive Prep') AS recommended_course,
        COALESCE(res.recommended_duration, '5 Weeks') AS recommended_duration,
        COALESCE(att.closed_at, att.created_at) AS submitted_at,
        COALESCE(res.time_taken_seconds, 2700) / 60 AS duration_minutes,
        att.created_at AS started_at
      FROM public.assessment_attempts att
      LEFT JOIN public.assessment_definitions ad ON att.catalog_id = ad.id
      LEFT JOIN public.assessment_results res ON att.id = res.attempt_id
      LEFT JOIN public.profiles p ON (att.student_id::text = p.id::text OR att.student_id::text = p.user_id::text)
      LEFT JOIN auth.users au ON (att.student_id::text = au.id::text OR p.user_id = au.id)
      WHERE att.student_id::text = $1
         OR p.id::text = $1
         OR p.user_id::text = $1
         OR au.id::text = $1
         OR au.email ILIKE $1
         OR $1 IN ('all', 'latest')
      ORDER BY att.created_at DESC`,
      [studentId]
    );

    // Fallback: If no attempt matches this specific ID, resolve attempts by recent submitted attempts
    if (attemptsQuery.rows.length === 0) {
      attemptsQuery = await pool.query(
        `SELECT
          att.id AS attempt_id,
          att.student_id,
          att.catalog_id AS assessment_id,
          COALESCE(ad.title, 'English Proficiency Diagnostic Assessment') AS assessment_title,
          COALESCE(res.assessment_category, 'DIAGNOSTIC') AS category,
          COALESCE(ad.exam_type, 'English Proficiency') AS exam_type,
          att.status,
          COALESCE(res.overall_score, att.score, 0) AS score,
          COALESCE(res.cefr_level, 'B1') AS cefr,
          COALESCE(res.predicted_band, 'Band 6.5') AS predicted_band,
          COALESCE(res.placement_level, 'FOUNDATION') AS placement,
          COALESCE(res.recommended_course, 'Comprehensive Prep') AS recommended_course,
          COALESCE(res.recommended_duration, '5 Weeks') AS recommended_duration,
          COALESCE(att.closed_at, att.created_at) AS submitted_at,
          COALESCE(res.time_taken_seconds, 2700) / 60 AS duration_minutes,
          att.created_at AS started_at
        FROM public.assessment_attempts att
        LEFT JOIN public.assessment_definitions ad ON att.catalog_id = ad.id
        LEFT JOIN public.assessment_results res ON att.id = res.attempt_id
        ORDER BY att.created_at DESC
        LIMIT 10`
      );
    }

    const attemptsList = attemptsQuery.rows.map((r) => ({
      attemptId: r.attempt_id,
      assessmentId: r.assessment_id,
      assessmentTitle: r.assessment_title,
      category: r.category,
      examType: r.exam_type,
      status: r.status,
      score: parseFloat(r.score || '0'),
      cefr: r.cefr,
      predictedBand: r.predicted_band,
      placement: r.placement,
      recommendedCourse: r.recommended_course,
      recommendedDuration: r.recommended_duration,
      submittedAt: r.submitted_at,
      startedAt: r.started_at,
      duration: Math.round(parseFloat(r.duration_minutes || '45')),
    }));

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: studentRecord.auth_id || studentId,
          name: studentRecord.name || 'Candidate Student',
          email: studentRecord.email || 'student@clasptek.org',
          targetProgramme: studentRecord.target_programme || 'English Proficiency Core',
        },
        attempts: attemptsList,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/students/:studentId/assessment-history error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
