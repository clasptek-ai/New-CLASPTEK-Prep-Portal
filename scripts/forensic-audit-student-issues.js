const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function runForensicAudit() {
  console.log('=================================================================');
  console.log('FORENSIC AUDIT: STUDENT IDENTITY & ASSESSMENT SUBMISSION');
  console.log('=================================================================\n');

  // 1. Check users & identity cross-links
  console.log('--- 1. AUTH & PUBLIC USER IDENTITY INTEGRITY ---');
  const userMismatch = await pool.query(`
    SELECT 
      au.id as auth_id, 
      au.email as auth_email, 
      pu.id as public_id, 
      pu.status as public_status,
      i.user_id as ident_user_id,
      i.email as ident_email,
      p.user_id as profile_user_id,
      p.first_name, p.last_name
    FROM auth.users au
    FULL OUTER JOIN public.users pu ON au.id = pu.id
    FULL OUTER JOIN public.identities i ON au.id = i.user_id
    FULL OUTER JOIN public.profiles p ON au.id = p.user_id
    ORDER BY au.created_at DESC
    LIMIT 10;
  `);

  console.table(
    userMismatch.rows.map((r) => ({
      auth_id: r.auth_id,
      auth_email: r.auth_email,
      public_id: r.public_id,
      ident_user_id: r.ident_user_id,
      profile_user_id: r.profile_user_id,
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
    }))
  );

  // 2. Check assessment attempts & results
  console.log('\n--- 2. ASSESSMENT ATTEMPTS & RESULTS CROSS-OWNERSHIP ---');
  const attempts = await pool.query(`
    SELECT 
      aa.id as attempt_id,
      aa.student_id as attempt_student_id,
      aa.status as attempt_status,
      aa.closed_at,
      ar.id as result_id,
      ar.student_id as result_student_id,
      ar.overall_score,
      ar.cefr_level,
      ar.predicted_band
    FROM public.assessment_attempts aa
    LEFT JOIN public.assessment_results ar ON aa.id = ar.attempt_id
    ORDER BY aa.started_at DESC
    LIMIT 10;
  `);

  console.table(attempts.rows);

  // 3. Check for orphan assessment results or attempts
  const orphanResults = await pool.query(`
    SELECT ar.id, ar.attempt_id, ar.student_id
    FROM public.assessment_results ar
    LEFT JOIN public.assessment_attempts aa ON ar.attempt_id = aa.id
    WHERE aa.id IS NULL;
  `);
  console.log(`\nOrphan assessment_results count: ${orphanResults.rows.length}`);

  // 4. Check assessment_results table constraints
  const constraints = await pool.query(`
    SELECT conname, contype, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'public.assessment_results'::regclass;
  `);
  console.log('\n--- ASSESSMENT_RESULTS TABLE CONSTRAINTS ---');
  constraints.rows.forEach((c) =>
    console.log(`Constraint: ${c.conname} (${c.contype}) => ${c.pg_get_constraintdef}`)
  );

  console.log('\n=================================================================');
  await pool.end();
}

runForensicAudit().catch((err) => {
  console.error('❌ Forensic audit failed:', err);
  process.exit(1);
});
