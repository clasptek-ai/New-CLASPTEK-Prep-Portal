process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env: Record<string, string> = {};
for (const line of envLines) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"#\r\n]*)"?/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
}

const connectionString = env.DATABASE_URL;

async function main() {
  console.log('=== IDENTITY RECONCILIATION JOB (sync:auth-users) ===');
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  // 1. Fetch all records from auth.users
  const authUsersRes = await pool.query(
    'SELECT id, email, raw_user_meta_data FROM auth.users WHERE deleted_at IS NULL'
  );
  console.log(`Found ${authUsersRes.rows.length} users in auth.users.`);

  let reconciledCount = 0;
  let alreadySyncedCount = 0;

  for (const authUser of authUsersRes.rows) {
    const { id: userId, email, raw_user_meta_data } = authUser;
    const firstName = raw_user_meta_data?.first_name || 'Clasptek';
    const lastName = raw_user_meta_data?.last_name || 'User';

    // Check if user exists in public.users
    const userCheck = await pool.query('SELECT id FROM public.users WHERE id = $1', [userId]);

    if (userCheck.rows.length > 0) {
      alreadySyncedCount++;
      console.log(`✓ User ${email} (${userId}) already synchronized.`);
      continue;
    }

    console.log(`➜ Reconciling missing user aggregate for: ${email} (${userId})...`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert public.users
      await client.query(
        `INSERT INTO public.users (id, status, version, updated_at)
         VALUES ($1, 'ACTIVE', 1, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [userId]
      );

      // Insert public.identities
      const identityId = crypto.randomUUID();
      await client.query(
        `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, updated_at)
         VALUES ($1, $2, $3, 'LOCAL', TRUE, $3, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (email) DO NOTHING`,
        [identityId, userId, email]
      );

      // Insert public.profiles
      const profileId = crypto.randomUUID();
      await client.query(
        `INSERT INTO public.profiles (id, user_id, first_name, last_name, locale, time_zone, version, updated_at)
         VALUES ($1, $2, $3, $4, 'en', 'UTC', 1, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO NOTHING`,
        [profileId, userId, firstName, lastName]
      );

      // Insert public.security_profiles
      const secProfileId = crypto.randomUUID();
      await client.query(
        `INSERT INTO public.security_profiles (id, user_id, preferred_mfa, failed_attempts, lock_status, security_preferences, version, updated_at)
         VALUES ($1, $2, NULL, 0, 'UNLOCKED', '{}'::jsonb, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO NOTHING`,
        [secProfileId, userId]
      );

      await client.query('COMMIT');
      reconciledCount++;
      console.log(`✓ Reconciled user aggregate & security profile for ${email} (${userId}).`);
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error(`✗ Failed to reconcile ${email}:`, err.message);
    } finally {
      client.release();
    }
  }

  console.log(`\n=== RECONCILIATION SUMMARY ===`);
  console.log(`Total Auth Users: ${authUsersRes.rows.length}`);
  console.log(`Already Synced:   ${alreadySyncedCount}`);
  console.log(`Newly Reconciled: ${reconciledCount}`);

  await pool.end();
}

main().catch(console.error);
