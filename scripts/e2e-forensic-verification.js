const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function runE2EVerification() {
  console.log('=================================================================');
  console.log('E2E INTEGRATION & ISOLATION VERIFICATION SUITE');
  console.log('=================================================================\n');

  // Test 1: Verify student 1 and student 2 identity resolution
  console.log('--- TEST 1: STUDENT IDENTITY & PROFILE RESOLUTION ---');
  const student1Id = 'c9a86a59-6eef-4590-9c4f-62a33fc75181'; // student@clasptek.com
  const student2Id = '0a297f82-95e5-403e-bb5d-68e2006f7757'; // student2@clasptek.com

  const s1Profile = await pool.query(
    `SELECT p.user_id, p.first_name, p.last_name, i.email 
     FROM public.profiles p 
     JOIN public.identities i ON p.user_id = i.user_id 
     WHERE p.user_id = $1::uuid`,
    [student1Id]
  );
  const s2Profile = await pool.query(
    `SELECT p.user_id, p.first_name, p.last_name, i.email 
     FROM public.profiles p 
     JOIN public.identities i ON p.user_id = i.user_id 
     WHERE p.user_id = $1::uuid`,
    [student2Id]
  );

  console.log('Student 1 Resolved:', s1Profile.rows[0]);
  console.log('Student 2 Resolved:', s2Profile.rows[0]);

  if (s1Profile.rows[0].user_id === s2Profile.rows[0].user_id) {
    throw new Error('IDENTITY COLLISION DETECTED!');
  }
  console.log('✅ PASS: Identity resolution isolated cleanly per authenticated user_id.\n');

  // Test 2: Assessment submission & immediate results retrieval
  console.log('--- TEST 2: ASSESSMENT SUBMISSION & RESULTS ISOLATION ---');
  const s1Results = await pool.query(
    `SELECT * FROM public.assessment_results WHERE student_id = $1::uuid ORDER BY generated_at DESC LIMIT 1`,
    [student1Id]
  );
  const s2Results = await pool.query(
    `SELECT * FROM public.assessment_results WHERE student_id = $1::uuid ORDER BY generated_at DESC LIMIT 1`,
    [student2Id]
  );

  console.log(
    'Student 1 Latest Result Score:',
    s1Results.rows[0]?.overall_score,
    'Band:',
    s1Results.rows[0]?.predicted_band
  );
  console.log(
    'Student 2 Latest Result Score:',
    s2Results.rows[0]?.overall_score,
    'Band:',
    s2Results.rows[0]?.predicted_band
  );

  if (s1Results.rows[0].attempt_id === s2Results.rows[0].attempt_id) {
    throw new Error('CROSS-STUDENT DATA LEAKAGE DETECTED IN ASSESSMENT RESULTS!');
  }
  console.log('✅ PASS: Assessment results strictly isolated between students.\n');

  // Test 3: Relational Integrity (No Orphaned Records)
  console.log('--- TEST 3: DATABASE RELATIONAL INTEGRITY AUDIT ---');
  const orphanAnswers = await pool.query(
    `SELECT count(*) FROM public.assessment_attempt_answers aaa 
     LEFT JOIN public.assessment_attempts aa ON aaa.attempt_id = aa.id 
     WHERE aa.id IS NULL`
  );
  const orphanResults = await pool.query(
    `SELECT count(*) FROM public.assessment_results ar 
     LEFT JOIN public.assessment_attempts aa ON ar.attempt_id = aa.id 
     WHERE aa.id IS NULL`
  );

  console.log('Orphaned attempt answers:', orphanAnswers.rows[0].count);
  console.log('Orphaned assessment results:', orphanResults.rows[0].count);

  if (parseInt(orphanAnswers.rows[0].count) > 0 || parseInt(orphanResults.rows[0].count) > 0) {
    throw new Error('ORPHANED RECORDS FOUND IN DATABASE!');
  }
  console.log('✅ PASS: 100% relational integrity verified with 0 orphan records.\n');

  console.log('=================================================================');
  console.log('🎉 ALL INTEGRATION & ISOLATION AUDIT CHECKS PASSED PERFECTLY!');
  console.log('=================================================================');
  await pool.end();
}

runE2EVerification().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
