const { Pool } = require('pg');
require('dotenv').config();

async function testReports() {
  console.log('=================================================================');
  console.log('ADMIN REPORTS & ACADEMIC ANALYTICS LIVE VERIFICATION');
  console.log('=================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  const totalStudentsRes = await pool.query(
    'SELECT COUNT(*) AS cnt FROM public.users WHERE is_deleted = false OR is_deleted IS NULL'
  );
  const avgReadinessRes = await pool.query(
    'SELECT ROUND(AVG(overall_score)::numeric, 1) AS avg_score FROM public.assessment_results'
  );
  const atRiskRes = await pool.query(
    'SELECT COUNT(DISTINCT student_id) AS cnt FROM public.assessment_results WHERE overall_score < 60.0'
  );
  const totalAssessmentsRes = await pool.query(
    "SELECT COUNT(*) AS cnt FROM public.assessment_attempts WHERE status = 'SUBMITTED'"
  );

  console.log('LIVE DATABASE KPI METRICS:');
  console.log(`- Total Students         : ${totalStudentsRes.rows[0]?.cnt}`);
  console.log(`- Average Readiness (%)  : ${avgReadinessRes.rows[0]?.avg_score || '0'}%`);
  console.log(`- At Risk Candidates     : ${atRiskRes.rows[0]?.cnt}`);
  console.log(`- Completed Assessments  : ${totalAssessmentsRes.rows[0]?.cnt}`);

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
      END AS "academicStatus"
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
    LIMIT 10
  `);

  console.log(`\nREAL CANDIDATES DIRECTORY SAMPLE (${studentsListRes.rows.length}):`);
  console.table(studentsListRes.rows);

  await pool.end();
}

testReports().catch((err) => console.error(err));
