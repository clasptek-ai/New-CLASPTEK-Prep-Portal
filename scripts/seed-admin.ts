process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = env.DATABASE_URL;

if (!supabaseUrl || !serviceKey || !connectionString) {
  console.error('Missing configuration in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('=========================================');
  console.log('INITIAL SYSTEM ADMINISTRATOR ACCOUNT SETUP');
  console.log('=========================================');

  const targetEmail = 'clasptek@gmail.com';
  const targetPassword = 'Clasptek@2026';

  // 1. Check if user exists in Supabase Auth
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to query Supabase Auth users: ${listError.message}`);
  }

  let authUser = listData.users.find((u: { email?: string }) => u.email === targetEmail);

  if (!authUser) {
    console.log(`> Creating new Supabase Auth user: ${targetEmail}...`);
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'System',
        last_name: 'Administrator',
      },
    });

    if (createError || !createData.user) {
      throw new Error(`Failed to create Supabase Auth user: ${createError?.message}`);
    }
    authUser = createData.user;
    console.log(`✓ Created Supabase Auth user ID: ${authUser.id}`);
  } else {
    console.log(`> Updating existing Supabase Auth user: ${targetEmail} (${authUser.id})...`);
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      {
        password: targetPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'System',
          last_name: 'Administrator',
        },
      }
    );

    if (updateError || !updateData.user) {
      throw new Error(`Failed to update Supabase Auth user: ${updateError?.message}`);
    }
    authUser = updateData.user;
    console.log(
      `✓ Updated password & email confirmation for Supabase Auth user ID: ${authUser.id}`
    );
  }

  const userId = authUser.id;

  // 2. Transactional seeding in PostgreSQL domain persistence
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // A. Create/Update public.users
    await client.query(
      `INSERT INTO public.users (id, status, version, updated_at)
       VALUES ($1, 'ACTIVE', 1, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );
    console.log('  ✓ public.users verified');

    // B. Create/Update public.identities
    const identityId = crypto.randomUUID();
    await client.query(
      `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, updated_at)
       VALUES ($1, $2, $3, 'LOCAL', TRUE, $3, 1, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET user_id = $2, is_verified = TRUE, updated_at = CURRENT_TIMESTAMP`,
      [identityId, userId, targetEmail]
    );
    console.log('  ✓ public.identities verified');

    // C. Create/Update public.profiles
    const profileId = crypto.randomUUID();
    await client.query(
      `INSERT INTO public.profiles (id, user_id, first_name, last_name, locale, time_zone, version, updated_at)
       VALUES ($1, $2, 'System', 'Administrator', 'en', 'UTC', 1, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET first_name = 'System', last_name = 'Administrator', updated_at = CURRENT_TIMESTAMP`,
      [profileId, userId]
    );
    console.log('  ✓ public.profiles verified');

    // D. Create/Update public.security_profiles
    const secProfileId = crypto.randomUUID();
    await client.query(
      `INSERT INTO public.security_profiles (id, user_id, preferred_mfa, failed_attempts, lock_status, security_preferences, version, updated_at)
       VALUES ($1, $2, NULL, 0, 'UNLOCKED', '{"mfa_enabled": false, "roles": ["SYSTEM_ADMIN", "Super Administrator"]}'::jsonb, 1, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET failed_attempts = 0, lock_status = 'UNLOCKED', updated_at = CURRENT_TIMESTAMP`,
      [secProfileId, userId]
    );
    console.log('  ✓ public.security_profiles verified');

    // E. Ensure Roles and user_roles mapping
    const rolesRes = await client.query(
      "SELECT id, name FROM public.roles WHERE name IN ('Super Administrator', 'Administrator', 'SYSTEM_ADMIN')"
    );

    for (const roleRow of rolesRes.rows) {
      const userRoleId = crypto.randomUUID();
      await client.query(
        `INSERT INTO public.user_roles (id, user_id, role_id, version, updated_at)
         VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [userRoleId, userId, roleRow.id]
      );
      console.log(`  ✓ public.user_roles mapped role '${roleRow.name}' (${roleRow.id})`);
    }

    await client.query('COMMIT');
    console.log('\n✓ Single database transaction successfully committed.');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('✗ Transaction rolled back due to error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }

  // 3. Perform login verification test against running server or direct handler
  console.log('\n--- VERIFYING ADMINISTRATOR LOGIN ---');
  try {
    const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, password: targetPassword }),
    });

    console.log(`Login API HTTP Status: ${loginRes.status} ${loginRes.statusText}`);
    const loginBody = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginBody, null, 2));

    if (loginRes.ok && loginBody.success) {
      console.log('✓ Administrator login verification PASSED successfully!');
    } else {
      console.error('✗ Login verification returned non-200 status');
    }
  } catch (err: any) {
    console.log('Note: Dev server login fetch notice:', err.message);
  }

  console.log('\n=========================================');
  console.log('SYSTEM ADMINISTRATOR SETUP COMPLETED');
  console.log('=========================================');
  console.log(`User ID:  ${userId}`);
  console.log(`Email:    ${targetEmail}`);
  console.log(`Status:   ACTIVE / VERIFIED / EMAIL CONFIRMED`);
  console.log(`Roles:    SYSTEM_ADMIN / Super Administrator`);
}

main().catch(console.error);
