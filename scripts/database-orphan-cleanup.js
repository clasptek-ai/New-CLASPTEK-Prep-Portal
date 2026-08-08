const { Pool } = require('pg');
require('dotenv').config();

async function cleanOrphanRecords() {
  console.log('=================================================================');
  console.log('CLASPTEK PREP PORTAL — PRODUCTION DATABASE ORPHAN CLEANUP');
  console.log('=================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  // 1. Delete orphan results
  const res1 = await pool.query(
    'DELETE FROM public.assessment_results WHERE student_id NOT IN (SELECT id FROM auth.users)'
  );
  console.log(`Deleted ${res1.rowCount} orphan assessment_results records.`);

  // 2. Delete orphan attempts
  const res2 = await pool.query(
    'DELETE FROM public.assessment_attempts WHERE student_id NOT IN (SELECT id FROM auth.users)'
  );
  console.log(`Deleted ${res2.rowCount} orphan assessment_attempts records.`);

  // 3. Delete orphan profiles
  const res3 = await pool.query(
    'DELETE FROM public.profiles WHERE user_id NOT IN (SELECT id FROM auth.users)'
  );
  console.log(`Deleted ${res3.rowCount} orphan profiles records.`);

  console.log('\nDatabase cleanup finished cleanly! Re-auditing...\n');

  const pCheck = await pool.query(
    'SELECT COUNT(*) FROM public.profiles WHERE user_id NOT IN (SELECT id FROM auth.users)'
  );
  const aCheck = await pool.query(
    'SELECT COUNT(*) FROM public.assessment_attempts WHERE student_id NOT IN (SELECT id FROM auth.users)'
  );
  const rCheck = await pool.query(
    'SELECT COUNT(*) FROM public.assessment_results WHERE student_id NOT IN (SELECT id FROM auth.users)'
  );

  console.log(
    `Orphan Profiles Remaining: ${pCheck.rows[0].count} ${pCheck.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );
  console.log(
    `Orphan Attempts Remaining: ${aCheck.rows[0].count} ${aCheck.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );
  console.log(
    `Orphan Results Remaining:  ${rCheck.rows[0].count} ${rCheck.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );

  await pool.end();
}

cleanOrphanRecords().catch((err) => console.error(err));
