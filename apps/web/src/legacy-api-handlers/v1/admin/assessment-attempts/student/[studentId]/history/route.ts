export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { getAuthenticatedSession } from '@/lib/auth-util';

/**
 * GET /api/v1/admin/assessment-attempts/student/:studentId/history
 * Returns the complete chronological assessment attempt history for a candidate,
 * grouped strictly by assessment definition with sequential attempt numbering.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
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

    const { studentId } = await params;
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'studentId parameter is required' },
        { status: 400 }
      );
    }

    const { dbPool } = await getDiagnosticContext();
    const pool = dbPool.getPool();

    // 1. Fetch Candidate Profile Info
    const userRes = await pool.query(
      `SELECT 
        au.id, 
        au.email, 
        COALESCE(NULLIF(TRIM(CONCAT(p.first_name, ' ', p.last_name)), ''), au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1), 'Candidate') as name
       FROM auth.users au
       LEFT JOIN public.profiles p ON (p.user_id = au.id OR p.id = au.id)
       WHERE au.id::text = $1 OR p.id::text = $1 OR p.user_id::text = $1
       LIMIT 1`,
      [studentId]
    );

    const studentInfo = userRes.rows[0] || {
      id: studentId,
      email: 'student@clasptek.ai',
      name: 'Candidate',
    };

    // 2. Fetch Diagnostic Attempts for this candidate with window-function attempt numbers
    const diagRes = await pool.query(
      `SELECT 
        aa.id as attempt_id,
        aa.student_id,
        aa.catalog_id as assessment_id,
        COALESCE(ad.title, 'IELTS Academic Readiness Diagnostic') as assessment_name,
        'DIAGNOSTIC' as assessment_type,
        aa.status as attempt_status,
        aa.started_at,
        aa.closed_at as submitted_at,
        aa.score,
        ROW_NUMBER() OVER (
          PARTITION BY aa.student_id, COALESCE(aa.catalog_id, 'a0000000-0000-0000-0000-000000000002') 
          ORDER BY aa.started_at ASC
        ) as attempt_number,
        COUNT(*) OVER (
          PARTITION BY aa.student_id, COALESCE(aa.catalog_id, 'a0000000-0000-0000-0000-000000000002')
        ) as total_attempts_in_assessment,
        ar.cefr_level,
        ar.predicted_band,
        ar.placement_level,
        ar.recommended_course
       FROM public.assessment_attempts aa
       LEFT JOIN public.assessment_definitions ad ON ad.id = aa.catalog_id
       LEFT JOIN LATERAL (
         SELECT cefr_level, predicted_band, placement_level, recommended_course
         FROM public.assessment_results ar
         WHERE ar.attempt_id = aa.id
         ORDER BY ar.generated_at DESC NULLS LAST LIMIT 1
       ) ar ON true
       WHERE (aa.student_id::text = $1) AND aa.deleted_at IS NULL
       ORDER BY aa.started_at ASC`,
      [studentId]
    );

    // 3. Fetch Mock Examination Sessions for this candidate
    const mockRes = await pool.query(
      `SELECT 
        ms.id as attempt_id,
        ms.student_id,
        ms.template_id as assessment_id,
        COALESCE(mb.title, ms.exam_type || ' Official Examination Simulation') as assessment_name,
        'MOCK' as assessment_type,
        ms.status as attempt_status,
        ms.started_at,
        ms.submitted_at,
        COALESCE(ms.official_scaled_score, ms.score_percentage, 0) as score,
        ROW_NUMBER() OVER (
          PARTITION BY ms.student_id, COALESCE(ms.template_id, '00000000-0000-0000-0000-000000000001') 
          ORDER BY ms.started_at ASC
        ) as attempt_number,
        COUNT(*) OVER (
          PARTITION BY ms.student_id, COALESCE(ms.template_id, '00000000-0000-0000-0000-000000000001')
        ) as total_attempts_in_assessment,
        CASE WHEN COALESCE(mr.official_scaled_score, ms.official_scaled_score, 0) >= 7.5 THEN 'C1' WHEN COALESCE(mr.official_scaled_score, ms.official_scaled_score, 0) >= 5.5 THEN 'B2' ELSE 'B1' END as cefr_level,
        COALESCE(mr.official_score_label, ms.official_score_label, 'Pending Evaluation') as predicted_band
       FROM public.mock_sessions ms
       LEFT JOIN public.mock_blueprints mb ON mb.id = ms.template_id
       LEFT JOIN LATERAL (
         SELECT official_scaled_score, official_score_label
         FROM public.mock_results mr
         WHERE mr.session_id = ms.id
         ORDER BY mr.scored_at DESC NULLS LAST LIMIT 1
       ) mr ON true
       WHERE (ms.student_id::text = $1)
       ORDER BY ms.started_at ASC`,
      [studentId]
    );

    // 4. Group by Assessment Definition
    const groupsMap: Record<
      string,
      {
        definitionId?: string;
        definitionTitle?: string;
        assessmentId: string;
        assessmentName: string;
        assessmentType: 'MOCK' | 'DIAGNOSTIC';
        totalAttempts: number;
        attempts: any[];
      }
    > = {};

    function processRow(row: any, type: 'MOCK' | 'DIAGNOSTIC') {
      const key = `${type}:${row.assessment_id || 'default'}`;
      if (!groupsMap[key]) {
        groupsMap[key] = {
          definitionId: row.assessment_id,
          definitionTitle: row.assessment_name,
          assessmentId: row.assessment_id,
          assessmentName: row.assessment_name,
          assessmentType: type,
          totalAttempts: parseInt(row.total_attempts_in_assessment, 10) || 1,
          attempts: [],
        };
      }

      const rawScore = row.score !== null ? parseFloat(row.score) : null;
      let scoreStatus: 'AVAILABLE' | 'PARTIAL' | 'PENDING' | 'NOT_SCORED' = 'NOT_SCORED';
      if (row.attempt_status === 'IN_PROGRESS') scoreStatus = 'PENDING';
      else if (rawScore !== null && (type === 'DIAGNOSTIC' || rawScore > 0))
        scoreStatus = 'AVAILABLE';
      else if (row.attempt_status === 'SUBMITTED' || row.attempt_status === 'COMPLETED')
        scoreStatus = 'PARTIAL';

      groupsMap[key].attempts.push({
        id: row.attempt_id,
        attemptId: row.attempt_id,
        studentId: row.student_id,
        studentName: studentInfo.name,
        studentEmail: studentInfo.email,
        assessmentId: row.assessment_id,
        assessmentName: row.assessment_name,
        assessmentType: type,
        attemptNumber: parseInt(row.attempt_number, 10),
        totalAttemptsByStudent: parseInt(row.total_attempts_in_assessment, 10),
        status: row.attempt_status,
        score: rawScore,
        scoreLabel:
          row.predicted_band ||
          (rawScore !== null
            ? type === 'MOCK'
              ? `Band ${rawScore.toFixed(1)}`
              : `${rawScore.toFixed(1)}%`
            : 'Pending Evaluation'),
        scoreStatus,
        cefrLevel: row.cefr_level || null,
        startedAt: row.started_at,
        submittedAt: row.submitted_at,
        durationSeconds: type === 'MOCK' ? 9900 : 2700,
        sectionsCompleted:
          type === 'MOCK'
            ? ['Listening', 'Reading', 'Writing', 'Speaking']
            : ['Grammar', 'Reading', 'Writing'],
      });
    }

    diagRes.rows.forEach((r) => processRow(r, 'DIAGNOSTIC'));
    mockRes.rows.forEach((r) => processRow(r, 'MOCK'));

    // Sort attempts within each group chronologically (newest first for review display)
    const assessmentGroups = Object.values(groupsMap).map((grp) => ({
      ...grp,
      attempts: grp.attempts.sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ),
    }));

    const totalAll = diagRes.rows.length + mockRes.rows.length;
    const candidateData = {
      id: studentInfo.id,
      name: studentInfo.name,
      email: studentInfo.email,
      candidateNumber: `CGA-${String(studentInfo.id).slice(0, 8).toUpperCase()}`,
      totalAttempts: totalAll,
    };

    return NextResponse.json({
      success: true,
      student: candidateData,
      assessmentGroups,
      data: {
        candidate: candidateData,
        assessmentGroups,
        totalAttemptsAllAssessments: totalAll,
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/assessment-attempts/student/:studentId/history error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
