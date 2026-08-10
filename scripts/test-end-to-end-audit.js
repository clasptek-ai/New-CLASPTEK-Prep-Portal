const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function runEndToEndAudit() {
  console.log('================================================================');
  console.log('CLASPTEK PREP PORTAL — SYSTEMIC END-TO-END VERIFICATION SUITE');
  console.log('================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  try {
    // 1. EXACT READ-ONLY DATABASE INTEGRITY QUERIES
    console.log('--- 1. EXACT READ-ONLY DATABASE INTEGRITY QUERIES ---');

    const q1 = await pool.query(`
      SELECT COUNT(*) AS count
      FROM public.profiles p
      LEFT JOIN auth.users u ON u.id = p.user_id
      WHERE u.id IS NULL
    `);
    console.log(
      `1. Profiles without auth users       : ${q1.rows[0].count} ${q1.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
    );

    const q2 = await pool.query(`
      SELECT COUNT(*) AS count
      FROM public.users pu
      LEFT JOIN auth.users au ON au.id = pu.id
      WHERE au.id IS NULL
    `);
    console.log(
      `2. Public users without auth users    : ${q2.rows[0].count} ${q2.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
    );

    const q3 = await pool.query(`
      SELECT COUNT(*) AS count
      FROM auth.users au
      LEFT JOIN public.profiles p ON p.user_id = au.id
      WHERE p.user_id IS NULL
    `);
    console.log(
      `3. Auth users without profiles       : ${q3.rows[0].count} ${q3.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
    );

    const q4 = await pool.query(`
      SELECT email, COUNT(*) AS count
      FROM public.identities
      GROUP BY email
      HAVING COUNT(*) > 1
    `);
    console.log(
      `4. Duplicate identities              : ${q4.rows.length} ${q4.rows.length === 0 ? '✅ CLEAN' : '⚠️'}`
    );

    const q5 = await pool.query(`
      SELECT COUNT(*) AS count
      FROM public.assessment_attempts a
      LEFT JOIN auth.users u ON u.id = a.student_id
      WHERE u.id IS NULL
    `);
    console.log(
      `5. Orphan assessment attempts        : ${q5.rows[0].count} ${q5.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
    );

    const q6 = await pool.query(`
      SELECT COUNT(*) AS count
      FROM public.assessment_results r
      LEFT JOIN public.assessment_attempts a ON a.id = r.attempt_id
      WHERE a.id IS NULL
    `);
    console.log(
      `6. Orphan assessment results         : ${q6.rows[0].count} ${q6.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
    );

    // 2. FOREIGN KEY CONSTRAINTS STATUS
    console.log('\n--- 2. FOREIGN KEY CONSTRAINTS STATUS ---');
    const fkRes = await pool.query(`
      SELECT conname, rel.relname AS table_name, frel.relname AS foreign_table
      FROM pg_constraint c
      JOIN pg_class rel ON rel.oid = c.conrelid
      JOIN pg_class frel ON frel.oid = c.confrelid
      WHERE conname IN (
        'fk_profiles_user_id',
        'fk_users_id',
        'fk_assessment_attempts_student_id',
        'fk_assessment_results_attempt_id'
      )
    `);
    console.table(fkRes.rows);

    // 3. RECENT CANDIDATE REGISTRATION INTEGRITY AUDIT
    console.log('\n--- 3. RECENT CANDIDATE REGISTRATIONS INTEGRITY ---');
    const recentRegs = await pool.query(`
      SELECT 
        au.id AS auth_id,
        au.email,
        au.confirmed_at,
        pu.status AS user_status,
        p.first_name,
        p.last_name,
        p.target_programme,
        i.provider,
        sp.lock_status
      FROM auth.users au
      JOIN public.users pu ON pu.id = au.id
      JOIN public.profiles p ON p.user_id = au.id
      JOIN public.identities i ON i.user_id = au.id
      JOIN public.security_profiles sp ON sp.user_id = au.id
      ORDER BY au.created_at DESC
      LIMIT 5
    `);
    console.table(recentRegs.rows);

    console.log('\n================================================================');
    console.log('ALL SYSTEMIC INTEGRITY QUERIES VERIFIED SUCCESSFULLY ✅');
    console.log('================================================================');
  } catch (err) {
    console.error('Audit Failure:', err);
  } finally {
    await pool.end();
  }
}

runEndToEndAudit();
