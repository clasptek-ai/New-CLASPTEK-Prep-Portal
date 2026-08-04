require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('================================================================================');
    console.log('   GATE 6: DEEP DATABASE INTEGRITY AUDIT (v1.0.0-RC1)');
    console.log('================================================================================\n');

    const checks = [
      {
        name: 'Orphan Answer Records (Global)',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempt_answers aaa LEFT JOIN public.assessment_attempts aa ON aa.id = aaa.attempt_id WHERE aa.id IS NULL`,
        target: 0,
      },
      {
        name: 'Orphan Result Records (Global)',
        query: `SELECT COUNT(*) as n FROM public.assessment_results ar LEFT JOIN public.assessment_attempts aa ON aa.id = ar.attempt_id WHERE aa.id IS NULL`,
        target: 0,
      },
      {
        name: 'Orphan Event Logs (Global)',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempt_events aae LEFT JOIN public.assessment_attempts aa ON aa.id = aae.attempt_id WHERE aa.id IS NULL`,
        target: 0,
      },
      {
        name: 'Duplicate Candidate Accounts in Profiles',
        query: `SELECT COUNT(*) - COUNT(DISTINCT user_id) as n FROM public.profiles WHERE user_id IS NOT NULL`,
        target: 0,
      },
      {
        name: 'Duplicate Assessment Attempt IDs',
        query: `SELECT COUNT(*) - COUNT(DISTINCT id) as n FROM public.assessment_attempts`,
        target: 0,
      },
      {
        name: 'Current Architecture Corrupted Paper Snapshots',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempts WHERE created_at >= '2026-08-03' AND (paper_snapshot IS NULL OR (paper_snapshot::text) = '{}' OR (paper_snapshot::text) NOT LIKE '%grammarQuestions%')`,
        target: 0,
      },
      {
        name: 'Null Values in Required Attempt Columns',
        query: `SELECT COUNT(*) as n FROM public.assessment_attempts WHERE student_id IS NULL OR catalog_id IS NULL OR status IS NULL OR started_at IS NULL`,
        target: 0,
      },
    ];

    let clean = true;
    for (const check of checks) {
      const res = await client.query(check.query);
      const count = parseInt(res.rows[0].n, 10);
      const status = count === check.target ? 'PASSED ✅' : 'FAILED ❌';
      console.log(`  ${check.name.padEnd(48)} Count: ${count} (Target: ${check.target}) → ${status}`);
      if (count !== check.target) clean = false;
    }

    console.log('\n--------------------------------------------------------------------------------');
    if (clean) {
      console.log('✅ DATABASE INTEGRITY AUDIT PASSED: 0 ORPHANS, 0 DUPLICATES, 0 CORRUPTED RECORDS');
    } else {
      console.error('❌ DATABASE INTEGRITY AUDIT FAILED — DATA CORRUPTION OR ORPHANS DETECTED');
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('Database integrity audit error:', e);
  process.exit(1);
});
