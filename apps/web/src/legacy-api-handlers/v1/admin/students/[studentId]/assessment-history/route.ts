export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/students/:studentId/assessment-history
 * Strictly retrieves ONLY genuine assessment attempts and mock sessions
 * belonging to the specified student.
 *
 * Scopes:
 * - Diagnostic Assessments (public.assessment_attempts)
 * - Mock Examination Sessions (public.mock_sessions)
 *
 * Invariant: Zero cross-student data leakage. No fallback to other students.
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
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Resolve canonical student identity
    const studentInfoQuery = await pool.query(
      `SELECT 
        au.id as auth_id,
        au.email,
        p.id as profile_id,
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
    );

    if (studentInfoQuery.rows.length === 0) {
      // Check if ID exists directly in public.users
      const publicUserQuery = await pool
        .query(
          `SELECT id as auth_id, email, id as profile_id, full_name as name, 'English Proficiency Core' as target_programme 
           FROM public.users WHERE id::text = $1 OR email ILIKE $1 LIMIT 1`,
          [studentId]
        )
        .catch(() => ({ rows: [] }));

      if (publicUserQuery.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: `Student not found for identifier: ${studentId}` },
          { status: 404 }
        );
      }
    }

    const studentRecord = studentInfoQuery.rows[0] || {};
    const canonicalAuthId = studentRecord.auth_id;
    const canonicalProfileId = studentRecord.profile_id || canonicalAuthId;
    const studentIds = Array.from(
      new Set([canonicalAuthId, canonicalProfileId, studentId].filter(Boolean))
    );

    // 2. Query Diagnostic Assessment Attempts strictly for this student
    const diagAttemptsQuery = await pool.query(
      `SELECT
        att.id AS attempt_id,
        att.student_id,
        att.catalog_id AS assessment_id,
        COALESCE(ad.title, 'Diagnostic Assessment') AS assessment_title,
        COALESCE(res.assessment_category, 'DIAGNOSTIC') AS category,
        COALESCE(ad.exam_type, 'English Proficiency') AS exam_type,
        att.status,
        COALESCE(res.overall_score, att.score, 0) AS score,
        res.cefr_level AS cefr,
        res.predicted_band AS predicted_band,
        COALESCE(res.placement_level, 'FOUNDATION') AS placement,
        COALESCE(res.recommended_course, 'Comprehensive Prep') AS recommended_course,
        COALESCE(res.recommended_duration, '5 Weeks') AS recommended_duration,
        COALESCE(att.closed_at, att.created_at) AS submitted_at,
        COALESCE(res.time_taken_seconds, att.duration_minutes * 60, 2700) / 60 AS duration_minutes,
        att.created_at AS started_at
      FROM public.assessment_attempts att
      LEFT JOIN public.assessment_definitions ad ON att.catalog_id = ad.id
      LEFT JOIN public.assessment_results res ON att.id = res.attempt_id
      WHERE att.student_id::text = ANY($1::text[])
        AND att.deleted_at IS NULL
      ORDER BY att.created_at DESC`,
      [studentIds]
    );

    // 3. Query Mock Examination Sessions strictly for this student
    const mockSessionsQuery = await pool.query(
      `SELECT
        ms.id AS attempt_id,
        ms.student_id,
        ms.template_id AS assessment_id,
        COALESCE(ms.exam_type, 'IELTS Academic Mock Examination') AS assessment_title,
        'MOCK' AS category,
        COALESCE(ms.exam_type, 'IELTS Academic') AS exam_type,
        ms.status,
        COALESCE(ms.score_percentage, 0) AS score,
        mr.cefr_level AS cefr,
        COALESCE(ms.official_score_label, mr.official_score_label, 'Pending Evaluation') AS predicted_band,
        'MOCK_LEVEL' AS placement,
        'IELTS Masterclass' AS recommended_course,
        '8 Weeks' AS recommended_duration,
        COALESCE(ms.submitted_at, ms.created_at) AS submitted_at,
        CASE 
          WHEN ms.time_remaining_seconds IS NOT NULL THEN ROUND((9900 - ms.time_remaining_seconds) / 60)
          ELSE 165
        END AS duration_minutes,
        ms.started_at AS started_at
      FROM public.mock_sessions ms
      LEFT JOIN public.mock_results mr ON ms.id = mr.session_id
      WHERE ms.student_id::text = ANY($1::text[])
      ORDER BY ms.created_at DESC`,
      [studentIds]
    );

    // 4. Combine and format both diagnostic attempts and mock sessions
    const rawList = [
      ...diagAttemptsQuery.rows.map((r) => ({
        attemptId: r.attempt_id,
        assessmentId: r.assessment_id,
        assessmentTitle: r.assessment_title,
        category: r.category,
        examType: r.exam_type,
        status: r.status,
        score: parseFloat(r.score || '0'),
        cefr: r.cefr || 'Pending',
        predictedBand: r.predicted_band || 'Pending Evaluation',
        placement: r.placement,
        recommendedCourse: r.recommended_course,
        recommendedDuration: r.recommended_duration,
        submittedAt: r.submitted_at,
        startedAt: r.started_at,
        duration: Math.round(parseFloat(r.duration_minutes || '45')),
      })),
      ...mockSessionsQuery.rows.map((r) => ({
        attemptId: r.attempt_id,
        assessmentId: r.assessment_id,
        assessmentTitle: r.assessment_title,
        category: r.category,
        examType: r.exam_type,
        status: r.status,
        score: parseFloat(r.score || '0'),
        cefr: r.cefr || 'Pending',
        predictedBand: r.predicted_band,
        placement: r.placement,
        recommendedCourse: r.recommended_course,
        recommendedDuration: r.recommended_duration,
        submittedAt: r.submitted_at,
        startedAt: r.started_at,
        duration: Math.round(parseFloat(r.duration_minutes || '165')),
      })),
    ];

    // Deduplicate by attemptId if needed and sort by startedAt desc
    const seenAttemptIds = new Set<string>();
    const attemptsList = rawList
      .filter((att) => {
        if (seenAttemptIds.has(att.attemptId)) return false;
        seenAttemptIds.add(att.attemptId);
        return true;
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: canonicalAuthId || studentId,
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
