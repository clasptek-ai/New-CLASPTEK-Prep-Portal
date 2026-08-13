export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { loadEnvironment } from '@clasptek/configuration';
import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await requireAdminSession(req);
    if (errorResponse) return errorResponse;

    const config = loadEnvironment(process.env);
    const logger = new ConsoleLogger('AdminReportsRoute');
    const dbPool = new DatabasePool(config, logger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    // 1. Total Students Count
    const totalStudentsRes = await pool.query(
      'SELECT COUNT(*) AS cnt FROM public.users WHERE is_deleted = false OR is_deleted IS NULL'
    );
    const totalStudents = parseInt(totalStudentsRes.rows[0]?.cnt || '0', 10);

    // 2. Average Readiness & Scores
    const avgReadinessRes = await pool.query(
      'SELECT ROUND(AVG(overall_score)::numeric, 1) AS avg_score FROM public.assessment_results'
    );
    const avgReadiness = parseFloat(avgReadinessRes.rows[0]?.avg_score || '0');

    // 3. At Risk Students Count (<60% score)
    const atRiskRes = await pool.query(
      'SELECT COUNT(DISTINCT student_id) AS cnt FROM public.assessment_results WHERE overall_score < 60.0'
    );
    const atRiskCount = parseInt(atRiskRes.rows[0]?.cnt || '0', 10);

    // 4. Total Assessments Completed
    const totalAssessmentsRes = await pool.query(
      "SELECT COUNT(*) AS cnt FROM public.assessment_attempts WHERE status = 'SUBMITTED'"
    );
    const totalAssessments = parseInt(totalAssessmentsRes.rows[0]?.cnt || '0', 10);

    // 5. Live Students Overview List
    const studentsListRes = await pool.query(`
      SELECT 
        u.id AS "studentId",
        COALESCE(NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''), au.email, 'Candidate User') AS "studentName",
        COALESCE(r.overall_score, 0.0) AS "overallScore",
        CASE 
          WHEN r.overall_score >= 80 THEN 'EXCELLING'
          WHEN r.overall_score >= 60 THEN 'ON_TRACK'
          WHEN r.overall_score IS NOT NULL THEN 'AT_RISK'
          ELSE 'PENDING'
        END AS "academicStatus",
        'STABLE' AS "performanceTrend",
        (SELECT COUNT(*) FROM public.assessment_attempts a WHERE a.student_id = u.id) AS "totalAssessments",
        (SELECT COUNT(*) FROM public.assessment_results res WHERE res.student_id = u.id) AS "totalEvaluations",
        COALESCE(r.generated_at, u.created_at) AS "lastCalculatedAt"
      FROM public.users u
      LEFT JOIN public.profiles p ON u.id = p.user_id
      LEFT JOIN auth.users au ON u.id = au.id
      LEFT JOIN LATERAL (
        SELECT overall_score, generated_at
        FROM public.assessment_results res
        WHERE res.student_id = u.id
        ORDER BY res.generated_at DESC
        LIMIT 1
      ) r ON TRUE
      WHERE u.is_deleted = false OR u.is_deleted IS NULL
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        avgReadiness,
        atRiskCount,
        totalAssessments,
        students: studentsListRes.rows.map((row) => ({
          ...row,
          overallScore: parseFloat(row.overallScore),
          totalAssessments: parseInt(row.totalAssessments, 10),
          totalEvaluations: parseInt(row.totalEvaluations, 10),
        })),
      },
    });
  } catch (err: any) {
    console.error('GET /api/v1/admin/reports error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
