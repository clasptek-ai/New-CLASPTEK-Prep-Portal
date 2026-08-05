require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function runDataQualityAudit() {
  const client = await pool.connect();
  try {
    console.log('================================================================================');
    console.log('   WORKSTREAM 11: DATA QUALITY GOVERNANCE AUDIT (v1.0.0-RC1 / v1.1)');
    console.log(
      '================================================================================\n'
    );

    const checks = [
      {
        name: 'Missing Foreign Keys (Orphan Answers)',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempt_answers aaa LEFT JOIN public.assessment_attempts aa ON aa.id = aaa.attempt_id WHERE aa.id IS NULL`,
      },
      {
        name: 'Missing Foreign Keys (Orphan Results)',
        query: `SELECT COUNT(*) as n FROM public.assessment_results ar LEFT JOIN public.assessment_attempts aa ON aa.id = ar.attempt_id WHERE aa.id IS NULL`,
      },
      {
        name: 'Missing Foreign Keys (Orphan Event Logs)',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempt_events aae LEFT JOIN public.assessment_attempts aa ON aa.id = aae.attempt_id WHERE aa.id IS NULL`,
      },
      {
        name: 'Duplicate Candidate Profiles',
        query: `SELECT COUNT(*) - COUNT(DISTINCT user_id) as n FROM public.profiles WHERE user_id IS NOT NULL`,
      },
      {
        name: 'Duplicate Assessment Attempt IDs',
        query: `SELECT COUNT(*) - COUNT(DISTINCT id) as n FROM public.assessment_attempts`,
      },
      {
        name: 'Invalid CEFR Level Enum Values',
        query: `SELECT COUNT(*) as n FROM public.assessment_results WHERE cefr_level IS NOT NULL AND cefr_level NOT IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')`,
      },
      {
        name: 'Invalid Placement Level Values',
        query: `SELECT COUNT(*) as n FROM public.assessment_results WHERE placement_level IS NOT NULL AND placement_level NOT IN ('FOUNDATION', 'INTERMEDIATE', 'ADVANCED')`,
      },
      {
        name: 'Corrupted Paper Snapshots (Current Deployment)',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempts WHERE created_at >= '2026-08-03' AND (paper_snapshot IS NULL OR (paper_snapshot::text) = '{}')`,
      },
      {
        name: 'Null Timestamps in Attempt Logs',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempts WHERE started_at IS NULL OR created_at IS NULL`,
      },
    ];

    let totalViolations = 0;
    let totalChecks = checks.length;
    let passedChecks = 0;

    for (const check of checks) {
      const res = await client.query(check.query);
      const count = parseInt(res.rows[0].n, 10);
      totalViolations += count;
      const status = count === 0 ? 'PASSED ✅' : 'VIOLATION ❌';
      if (count === 0) passedChecks++;
      console.log(`  ${check.name.padEnd(52)} Count: ${count} → ${status}`);
    }

    const dataQualityScore = (
      ((totalChecks - (totalChecks - passedChecks)) / totalChecks) *
      100
    ).toFixed(1);

    console.log(
      '\n--------------------------------------------------------------------------------'
    );
    console.log(`DATA QUALITY GOVERNANCE METRICS:`);
    console.log(`  Data Quality Score:       ${dataQualityScore}%`);
    console.log(`  Total Checks Executed:    ${totalChecks}`);
    console.log(`  Passed Integrity Checks:  ${passedChecks} / ${totalChecks}`);
    console.log(`  Total Violation Count:    ${totalViolations}`);
    console.log(`  Data Quality Status:      ${totalViolations === 0 ? 'PASS ✅' : 'WARNING ⚠️'}`);
    console.log('--------------------------------------------------------------------------------');
  } finally {
    client.release();
    await pool.end();
  }
}

runDataQualityAudit().catch((err) => {
  console.error('Data quality audit error:', err);
  process.exit(1);
});
