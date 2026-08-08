const { Pool } = require('pg');
require('dotenv').config();

async function runForensicAudit() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
      'sslmode=verify-full',
      'sslmode=no-verify'
    ),
    ssl: { rejectUnauthorized: false },
  });

  console.log('=================================================================');
  console.log('CLASPTEK PREP PORTAL — PRODUCTION FORENSIC DATABASE AUDIT');
  console.log('=================================================================\n');

  // 1. Audit public.profiles & auth.users
  console.log('--- 1. ALL USERS IN PUBLIC.PROFILES & AUTH.USERS ---');
  const usersRes = await pool.query(
    `SELECT u.id, u.email, u.email_confirmed_at, u.created_at, p.first_name, p.last_name
     FROM auth.users u
     LEFT JOIN public.profiles p ON u.id = p.user_id
     ORDER BY u.created_at DESC`
  );

  console.table(
    usersRes.rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      email_confirmed: !!r.email_confirmed_at,
      created_at: r.created_at,
    }))
  );

  // 2. Identify Test / Seed / QA Users
  console.log('\n--- 2. CATEGORIZATION OF USERS IN DATABASE ---');
  const testKeywords = [
    'audit',
    'test',
    'verification',
    'candidate',
    'dummy',
    'mock',
    'seed',
    'qa',
    'live_verify',
  ];

  const testUsers = [];
  const genuineUsers = [];

  for (const user of usersRes.rows) {
    const nameEmail =
      `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''}`.toLowerCase();
    const isTest = testKeywords.some((kw) => nameEmail.includes(kw));
    if (isTest) {
      testUsers.push(user);
    } else {
      genuineUsers.push(user);
    }
  }

  console.log(`Genuine Production Users Count: ${genuineUsers.length}`);
  console.table(
    genuineUsers.map((u) => ({ id: u.id, email: u.email, name: `${u.first_name} ${u.last_name}` }))
  );

  console.log(`\nTest / Seed / Verification / QA Users Count: ${testUsers.length}`);
  console.table(
    testUsers.map((u) => ({ id: u.id, email: u.email, name: `${u.first_name} ${u.last_name}` }))
  );

  // 3. Orphan & Relational Integrity Audit
  console.log('\n--- 3. ORPHAN RECORDS & RELATIONAL INTEGRITY AUDIT ---');
  const orphanProfiles = await pool.query(
    `SELECT p.user_id, p.first_name, p.last_name FROM public.profiles p LEFT JOIN auth.users u ON p.user_id = u.id WHERE u.id IS NULL`
  );
  console.log(`Orphaned Profiles (profiles without auth.users): ${orphanProfiles.rows.length}`);
  if (orphanProfiles.rows.length > 0) console.table(orphanProfiles.rows);

  const orphanIdentities = await pool.query(
    `SELECT i.user_id, i.email FROM public.identities i LEFT JOIN auth.users u ON i.user_id = u.id WHERE u.id IS NULL`
  );
  console.log(
    `Orphaned Identities (identities without auth.users): ${orphanIdentities.rows.length}`
  );
  if (orphanIdentities.rows.length > 0) console.table(orphanIdentities.rows);

  const orphanAttempts = await pool.query(
    `SELECT a.id, a.student_id FROM public.assessment_attempts a LEFT JOIN auth.users u ON a.student_id = u.id WHERE u.id IS NULL`
  );
  console.log(`Orphaned Assessment Attempts: ${orphanAttempts.rows.length}`);

  const orphanResults = await pool.query(
    `SELECT r.id, r.student_id FROM public.assessment_results r LEFT JOIN auth.users u ON r.student_id = u.id WHERE u.id IS NULL`
  );
  console.log(`Orphaned Assessment Results: ${orphanResults.rows.length}`);

  console.log('\n=================================================================');
  await pool.end();
}

runForensicAudit().catch((err) => console.error(err));
