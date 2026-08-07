const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function applyLockoutSchema() {
  console.log('=================================================================');
  console.log('APPLYING SECURITY PROFILES ENTERPRISE LOCKOUT SCHEMA MIGRATION');
  console.log('=================================================================\n');

  await pool.query(`
    ALTER TABLE public.security_profiles
    ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_failed_attempt TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lock_count INT DEFAULT 0;
  `);

  // Auto-unlock existing stale locks from forensic audit
  await pool.query(`
    UPDATE public.security_profiles
    SET lock_status = 'UNLOCKED',
        failed_attempts = 0,
        lock_expires_at = NULL
    WHERE lock_status = 'LOCKED' AND (lock_expires_at IS NULL OR lock_expires_at <= NOW());
  `);

  console.log(
    '✓ Columns (locked_at, lock_expires_at, last_failed_attempt, lock_count) verified on public.security_profiles'
  );
  console.log('✓ Stale locked accounts unlocked cleanly');
  console.log('=================================================================');
  await pool.end();
}

applyLockoutSchema().catch((err) => {
  console.error('❌ Lockout schema migration failed:', err);
  process.exit(1);
});
