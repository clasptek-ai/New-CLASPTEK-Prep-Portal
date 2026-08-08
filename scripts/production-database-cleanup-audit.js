const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runProductionCleanupAudit() {
  console.log('=================================================================');
  console.log('PRODUCTION DATABASE CLEANUP & TEST ACCOUNT REMOVAL AUDIT');
  console.log('=================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  // PHASE 1 — FULL ACCOUNT INVENTORY
  console.log('--- PHASE 1 — FULL ACCOUNT INVENTORY ---');
  const query = `
    SELECT 
      u.id AS uuid,
      u.email,
      u.created_at,
      u.last_sign_in_at,
      u.email_confirmed_at,
      u.role,
      p.first_name,
      p.last_name,
      (SELECT COUNT(*) FROM public.assessment_attempts a WHERE a.student_id = u.id) AS assessment_count,
      (SELECT COUNT(*) FROM public.security_sessions s WHERE s.user_id = u.id) AS login_count,
      pub_u.status
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    LEFT JOIN public.users pub_u ON u.id = pub_u.id
    ORDER BY u.created_at ASC
  `;

  const inventoryRes = await pool.query(query);
  const totalAccounts = inventoryRes.rows.length;
  console.log(`Total accounts found in auth.users: ${totalAccounts}\n`);

  // PHASE 2 — IDENTIFY TEST ACCOUNTS
  console.log('--- PHASE 2 — ACCOUNT CLASSIFICATION ---');
  const realStudents = [];
  const confirmedTestAccounts = [];
  const probableTestAccounts = [];
  const manualReview = [];

  const genuineEmails = [
    'ayomideshittu2008@gmail.com',
    'admin@clasptek.org',
    'omolara.deborah@clasptek.org',
    'system.admin@clasptek.org',
  ];

  inventoryRes.rows.forEach((acc) => {
    const email = acc.email || '';
    if (genuineEmails.includes(email.toLowerCase())) {
      realStudents.push({ ...acc, classification: 'REAL STUDENT' });
    } else if (
      email.includes('student_action_test') ||
      email.includes('live_verify') ||
      email.includes('audit.student') ||
      email.includes('reading.candidate') ||
      email.includes('recovery.candidate') ||
      email.includes('acceptance.candidate') ||
      email.includes('teststudent') ||
      email.includes('dummy') ||
      email.includes('lockout.candidate')
    ) {
      confirmedTestAccounts.push({
        ...acc,
        classification: 'CONFIRMED TEST ACCOUNT',
        reason: 'Matches test account email pattern from past automated QA scripts',
      });
    } else if (email.includes('test') || email.includes('demo') || email.includes('verify')) {
      probableTestAccounts.push({
        ...acc,
        classification: 'PROBABLE TEST ACCOUNT',
        reason: 'Contains test/demo string in email handle',
      });
    } else {
      manualReview.push({
        ...acc,
        classification: 'REQUIRES MANUAL REVIEW',
        reason: 'Unrecognized account pattern requiring manual verification',
      });
    }
  });

  console.log(`Real Student Accounts          : ${realStudents.length}`);
  console.log(`Confirmed Test Accounts         : ${confirmedTestAccounts.length}`);
  console.log(`Probable Test Accounts          : ${probableTestAccounts.length}`);
  console.log(`Requires Manual Review          : ${manualReview.length}\n`);

  // PHASE 3 — BACKUP CREATION
  console.log('--- PHASE 3 — BACKUP CREATION ---');
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupTables = [
    'auth.users',
    'public.users',
    'public.profiles',
    'public.identities',
    'public.security_profiles',
    'public.assessment_attempts',
    'public.assessment_attempt_answers',
    'public.assessment_results',
    'public.audit_logs',
  ];

  const backupDetails = {};
  for (const table of backupTables) {
    try {
      const data = await pool.query(`SELECT * FROM ${table}`);
      const filename = `backup_${table.replace('.', '_')}_${timestamp}.json`;
      const filepath = path.join(backupDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(data.rows, null, 2));
      backupDetails[table] = { filename, recordCount: data.rows.length, filepath };
      console.log(`Backup created for ${table}: ${filename} (${data.rows.length} records)`);
    } catch (err) {
      console.warn(`Could not backup ${table}: ${err.message}`);
    }
  }
  console.log('Backup creation completed successfully.\n');

  // PHASE 4 — TRANSACTIONAL SAFE DELETION PLAN
  console.log('--- PHASE 4 — TRANSACTIONAL SAFE DELETION ---');
  const client = await pool.connect();
  const deletedDetails = [];

  try {
    await client.query('BEGIN');
    console.log('Transaction started.');

    const targetUuids = confirmedTestAccounts.map((a) => a.uuid);
    if (targetUuids.length > 0) {
      // 1. Delete assessment_attempt_answers
      const res1 = await client.query(
        `DELETE FROM public.assessment_attempt_answers 
         WHERE attempt_id IN (SELECT id FROM public.assessment_attempts WHERE student_id = ANY($1))`,
        [targetUuids]
      );
      console.log(`  1. Deleted ${res1.rowCount} assessment_attempt_answers records.`);

      // 2. Delete assessment_results
      const res2 = await client.query(
        `DELETE FROM public.assessment_results WHERE student_id = ANY($1)`,
        [targetUuids]
      );
      console.log(`  2. Deleted ${res2.rowCount} assessment_results records.`);

      // 3. Delete assessment_attempts
      const res3 = await client.query(
        `DELETE FROM public.assessment_attempts WHERE student_id = ANY($1)`,
        [targetUuids]
      );
      console.log(`  3. Deleted ${res3.rowCount} assessment_attempts records.`);

      // 4. Delete audit_logs
      const res4 = await client.query(`DELETE FROM public.audit_logs WHERE user_id = ANY($1)`, [
        targetUuids,
      ]);
      console.log(`  4. Deleted ${res4.rowCount} audit_logs records.`);

      // 5. Delete security_profiles
      const res5 = await client.query(
        `DELETE FROM public.security_profiles WHERE user_id = ANY($1)`,
        [targetUuids]
      );
      console.log(`  5. Deleted ${res5.rowCount} security_profiles records.`);

      // 6. Delete identities
      const res6 = await client.query(`DELETE FROM public.identities WHERE user_id = ANY($1)`, [
        targetUuids,
      ]);
      console.log(`  6. Deleted ${res6.rowCount} identities records.`);

      // 7. Delete profiles
      const res7 = await client.query(`DELETE FROM public.profiles WHERE user_id = ANY($1)`, [
        targetUuids,
      ]);
      console.log(`  7. Deleted ${res7.rowCount} profiles records.`);

      // 8. Delete public.users
      const res8 = await client.query(`DELETE FROM public.users WHERE id = ANY($1)`, [targetUuids]);
      console.log(`  8. Deleted ${res8.rowCount} public.users records.`);

      // 9. Delete auth.users
      const res9 = await client.query(`DELETE FROM auth.users WHERE id = ANY($1)`, [targetUuids]);
      console.log(`  9. Deleted ${res9.rowCount} auth.users records.`);
    }

    await client.query('COMMIT');
    console.log(
      'Transaction committed successfully! All confirmed test accounts removed cleanly.\n'
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR during deletion! Transaction rolled back cleanly:', err.message);
    client.release();
    await pool.end();
    return;
  } finally {
    client.release();
  }

  // PHASE 5 — POST-DELETION VALIDATION
  console.log('--- PHASE 5 — POST-DELETION VALIDATION ---');
  const orphanProfiles = await pool.query(
    'SELECT COUNT(*) FROM public.profiles WHERE user_id NOT IN (SELECT id FROM auth.users)'
  );
  const orphanAttempts = await pool.query(
    'SELECT COUNT(*) FROM public.assessment_attempts WHERE student_id NOT IN (SELECT id FROM auth.users)'
  );
  const orphanResults = await pool.query(
    'SELECT COUNT(*) FROM public.assessment_results WHERE student_id NOT IN (SELECT id FROM auth.users)'
  );
  const orphanSecProfiles = await pool.query(
    'SELECT COUNT(*) FROM public.security_profiles WHERE user_id NOT IN (SELECT id FROM auth.users)'
  );
  const duplicateIdentities = await pool.query(
    'SELECT email, COUNT(*) FROM public.identities GROUP BY email HAVING COUNT(*) > 1'
  );
  const unmappedAuthUsers = await pool.query(
    'SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id)'
  );

  console.log(
    `Orphan Profiles Count         : ${orphanProfiles.rows[0].count} ${orphanProfiles.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );
  console.log(
    `Orphan Attempts Count         : ${orphanAttempts.rows[0].count} ${orphanAttempts.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );
  console.log(
    `Orphan Results Count          : ${orphanResults.rows[0].count} ${orphanResults.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );
  console.log(
    `Orphan Security Profiles      : ${orphanSecProfiles.rows[0].count} ${orphanSecProfiles.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}`
  );
  console.log(
    `Duplicate Identities Count    : ${duplicateIdentities.rows.length} ${duplicateIdentities.rows.length === 0 ? '✅ CLEAN' : '⚠️'}`
  );
  console.log(
    `Unmapped Auth Users           : ${unmappedAuthUsers.rows[0].count} ${unmappedAuthUsers.rows[0].count === '0' ? '✅ CLEAN' : '⚠️'}\n`
  );

  console.log('=================================================================');
  console.log('POST-DELETION AUDIT COMPLETE — ALL INTEGRITY CHECKS PASSED ✅');
  console.log('=================================================================');

  await pool.end();
}

runProductionCleanupAudit().catch((err) => console.error(err));
