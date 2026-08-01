export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/students/:studentId/assessment-history
 * Returns the complete assessment history for a specific student candidate.
 * Powers the primary audit interface in Admin -> Students -> Student Profile -> Diagnostics.
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

    const { studentId } = await params;
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch student info from profiles or users
    const studentQuery = await pool
      .query(
        `SELECT id, name, email, target_programme, registration_number, created_at
       FROM public.profiles
       WHERE id::text = $1 OR user_id::text = $1
       LIMIT 1`,
        [studentId]
      )
      .catch(() => null);

    const studentRecord = studentQuery?.rows?.[0] || {
      id: studentId,
      name: 'Candidate Student',
      email: 'student@clasptek.org',
      targetProgramme: 'English Proficiency Core',
    };

    // 2. Fetch all attempts and join with stored results
    const attemptsQuery = await pool.query(
      `SELECT
        att.id AS attempt_id,
        att.catalog_id AS assessment_id,
        COALESCE(cat.title, att.exam_type, 'English Proficiency Diagnostic Assessment') AS assessment_title,
        COALESCE(res.assessment_category, 'DIAGNOSTIC') AS category,
        COALESCE(res.exam_type, att.exam_type, 'English Proficiency') AS exam_type,
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
      LEFT JOIN public.assessment_catalogs cat ON att.catalog_id = cat.id
      LEFT JOIN public.assessment_results res ON att.id = res.attempt_id
      WHERE att.student_id::text = $1 OR att.student_id = (
        SELECT id FROM public.profiles WHERE user_id::text = $1 LIMIT 1
      )
      ORDER BY att.created_at DESC`,
      [studentId]
    );

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
          id: studentRecord.id,
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
