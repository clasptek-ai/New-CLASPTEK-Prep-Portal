const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function runForensicAudit() {
  console.log('=== FORENSIC DATABASE & SCHEMA AUDIT ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rawDbUrl = process.env.DATABASE_URL || '';

  const dbUrl = rawDbUrl.includes('sslmode')
    ? rawDbUrl.replace('sslmode=verify-full', 'sslmode=no-verify')
    : rawDbUrl;

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  let client;
  try {
    client = await pool.connect();
    console.log('Connected to Database successfully!');
  } catch (err) {
    console.error('Failed with original URL, trying port 5432:', err.message);
    const altPool = new Pool({
      connectionString: dbUrl.replace(':6543/', ':5432/'),
      ssl: { rejectUnauthorized: false },
    });
    client = await altPool.connect();
    console.log('Connected via port 5432 successfully!');
  }

  try {
    // 1. Inspect Foreign Key Constraints
    console.log('\n--- 1. Foreign Key Constraints involving public.users & auth.users ---');
    const fkRes = await client.query(`
      SELECT
        conname,
        conrelid::regclass AS source_table,
        confrelid::regclass AS target_table,
        pg_get_constraintdef(oid) AS constraint_def
      FROM pg_constraint
      WHERE conrelid::regclass::text IN ('public.users', 'public.profiles', 'public.identities', 'public.security_profiles', 'public.candidates', 'public.student_programme_enrollments')
         OR confrelid::regclass::text IN ('public.users', 'auth.users')
      ORDER BY source_table, conname;
    `);
    console.table(fkRes.rows);

    // 2. Check for archived / soft-deleted users in public.users
    console.log('\n--- 2. Users in public.users ---');
    const deletedUsersRes = await client.query(`
      SELECT id, status, is_deleted, deleted_at, created_at, updated_at
      FROM public.users;
    `);
    console.table(deletedUsersRes.rows);

    // 3. Check identities table for email mapping
    console.log('\n--- 3. Identities records ---');
    const identRes = await client.query(`
      SELECT id, user_id, email, provider, is_verified, deleted_at
      FROM public.identities;
    `);
    console.table(identRes.rows);

    // 4. Check Supabase auth.users list
    console.log('\n--- 4. Supabase auth.users (via admin client) ---');
    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authErr) {
      console.error('Error fetching auth.users:', authErr);
    } else {
      console.table(
        authUsers.users.map((u) => ({
          id: u.id,
          email: u.email,
          banned_until: u.banned_until,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        }))
      );
    }

    // 5. Check for orphaned records between auth.users and public.users
    console.log('\n--- 5. Orphaned Records Check ---');
    const authIds = (authUsers?.users || []).map((u) => u.id);

    const publicUsersRes = await client.query('SELECT id, status, is_deleted FROM public.users');
    const publicUserIds = publicUsersRes.rows.map((r) => r.id);

    console.log('auth.users count:', authIds.length);
    console.log('public.users count:', publicUserIds.length);

    const authNoPublic = authIds.filter((id) => !publicUserIds.includes(id));
    const publicNoAuth = publicUserIds.filter((id) => !authIds.includes(id));

    console.log('\nIn auth.users BUT NOT in public.users:', authNoPublic);
    console.log('In public.users BUT NOT in auth.users:', publicNoAuth);

    // 6. Profiles & Candidates
    console.log('\n--- 6. Profiles ---');
    const profilesRes = await client.query(
      'SELECT id, user_id, first_name, last_name FROM public.profiles'
    );
    console.table(profilesRes.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

runForensicAudit().catch((err) => console.error('Audit failed:', err));
