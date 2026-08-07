const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function checkUserSecurity() {
  console.log('=================================================================');
  console.log('FORENSIC INVESTIGATION: LOGIN USER & SECURITY PROFILE STATUS');
  console.log('=================================================================\n');

  // Query auth.users
  const authUsers = await pool.query(`
    SELECT id, email, email_confirmed_at, banned_until, raw_user_meta_data, created_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10;
  `);

  console.log('--- AUTH.USERS SNAPSHOT (TOP 10) ---');
  authUsers.rows.forEach((u) => {
    console.log(
      `User ID: ${u.id} | Email: ${u.email} | ConfirmedAt: ${u.email_confirmed_at} | BannedUntil: ${u.banned_until}`
    );
  });

  // Query public.users
  const publicUsers = await pool.query(`
    SELECT id, status, is_deleted, deleted_at, practice_gate_locked, mock_gate_locked, created_at
    FROM public.users
    ORDER BY created_at DESC
    LIMIT 10;
  `);

  console.log('\n--- PUBLIC.USERS SNAPSHOT (TOP 10) ---');
  publicUsers.rows.forEach((u) => {
    console.log(
      `User ID: ${u.id} | Status: ${u.status} | DeletedAt: ${u.deleted_at} | IsDeleted: ${u.is_deleted}`
    );
  });

  // Query public.security_profiles
  try {
    const secProfiles = await pool.query(`
      SELECT user_id, lock_status, failed_attempts, updated_at
      FROM public.security_profiles;
    `);

    console.log('\n--- PUBLIC.SECURITY_PROFILES SNAPSHOT ---');
    secProfiles.rows.forEach((sp) => {
      console.log(
        `User ID: ${sp.user_id} | LockStatus: ${sp.lock_status} | FailedAttempts: ${sp.failed_attempts}`
      );
    });
  } catch (err) {
    console.log('\n--- PUBLIC.SECURITY_PROFILES ---');
    console.log(`Table query error: ${err.message}`);
  }

  // Query identities table
  try {
    const idents = await pool.query(`
      SELECT user_id, email, deleted_at
      FROM identities;
    `);

    console.log('\n--- IDENTITIES SNAPSHOT ---');
    idents.rows.forEach((i) => {
      console.log(`User ID: ${i.user_id} | Email: ${i.email} | DeletedAt: ${i.deleted_at}`);
    });
  } catch (err) {
    console.log('\n--- IDENTITIES TABLE ---');
    console.log(`Table query error: ${err.message}`);
  }

  console.log('=================================================================');
  await pool.end();
}

checkUserSecurity().catch((err) => {
  console.error('❌ Check failed:', err);
  process.exit(1);
});
