const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');
  const isDryRun = !isApply;

  console.log('================================================================');
  console.log(
    `ORPHANED USER ACCOUNTS DIAGNOSTIC & CLEANUP AUDIT (${isDryRun ? 'DRY-RUN READ-ONLY' : 'APPLY MODE'})`
  );
  console.log('================================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const rawDbUrl = process.env.DATABASE_URL || '';

  const dbUrl = rawDbUrl.includes('sslmode')
    ? rawDbUrl.replace('sslmode=verify-full', 'sslmode=no-verify')
    : rawDbUrl;

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  const client = await pool.connect();
  try {
    // 1. Fetch auth.users IDs from Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    let authIds = [];
    if (authErr) {
      console.warn(
        '⚠️ Warning: listUsers via Supabase client failed, querying auth.users via SQL fallback...'
      );
      const authSqlRes = await client.query('SELECT id, email FROM auth.users');
      authIds = authSqlRes.rows.map((r) => r.id);
    } else {
      authIds = (authData.users || []).map((u) => u.id);
    }

    console.log(`Verified Active auth.users count: ${authIds.length}`);

    // 2. Query public.users records
    const usersRes = await client.query(`
      SELECT id, status, is_deleted, created_at, updated_at
      FROM public.users
    `);
    const publicUsers = usersRes.rows;

    const orphanedPublicUsers = publicUsers.filter((u) => !authIds.includes(u.id));

    console.log(`Total public.users count: ${publicUsers.length}`);
    console.log(
      `Orphaned public.users count (no parent auth.users): ${orphanedPublicUsers.length}\n`
    );

    if (orphanedPublicUsers.length > 0) {
      console.log('--- ORPHANED PUBLIC.USERS SUMMARY ---');
      console.table(
        orphanedPublicUsers.map((u) => ({
          userId: u.id,
          status: u.status,
          isDeleted: u.is_deleted,
          createdAt: u.created_at,
          safeToRemove: true,
        }))
      );
    }

    // 3. Query orphaned identities
    const identRes = await client.query(`
      SELECT id, user_id, email, provider, created_at
      FROM public.identities
    `);
    const orphanedIdentities = identRes.rows.filter((i) => !authIds.includes(i.user_id));

    if (orphanedIdentities.length > 0) {
      console.log('\n--- ORPHANED IDENTITIES SUMMARY ---');
      console.table(
        orphanedIdentities.map((i) => ({
          identityId: i.id,
          userId: i.user_id,
          email: i.email,
          provider: i.provider,
          safeToRemove: true,
        }))
      );
    }

    // 4. Query orphaned profiles
    const profRes = await client.query(`
      SELECT id, user_id, first_name, last_name
      FROM public.profiles
    `);
    const orphanedProfiles = profRes.rows.filter((p) => !authIds.includes(p.user_id));

    if (orphanedProfiles.length > 0) {
      console.log('\n--- ORPHANED PROFILES SUMMARY ---');
      console.table(
        orphanedProfiles.map((p) => ({
          profileId: p.id,
          userId: p.user_id,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          safeToRemove: true,
        }))
      );
    }

    // 5. If --apply mode is active, perform safe cleanup of confirmed orphaned records
    if (isApply && (orphanedPublicUsers.length > 0 || orphanedIdentities.length > 0)) {
      console.log('\n--- EXECUTING SAFE ORPHAN CLEANUP TRANSACTION (--apply) ---');
      const orphanUserIds = [
        ...new Set([
          ...orphanedPublicUsers.map((u) => u.id),
          ...orphanedIdentities.map((i) => i.user_id),
          ...orphanedProfiles.map((p) => p.user_id),
        ]),
      ];

      await client.query('BEGIN');

      try {
        for (const orphanId of orphanUserIds) {
          await client.query('DELETE FROM public.security_profiles WHERE user_id = $1', [orphanId]);
          await client.query('DELETE FROM public.user_roles WHERE user_id = $1', [orphanId]);
          await client.query('DELETE FROM public.identities WHERE user_id = $1', [orphanId]);
          await client.query('DELETE FROM public.profiles WHERE user_id = $1', [orphanId]);
          await client.query(
            'DELETE FROM public.student_programme_enrollments WHERE student_id = $1',
            [orphanId]
          );
          await client.query('DELETE FROM public.users WHERE id = $1', [orphanId]);
        }

        await client.query('COMMIT');
        console.log(
          `✅ Successfully cleaned up ${orphanUserIds.length} orphaned application user aggregates.`
        );
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Orphan cleanup transaction failed:', err);
      }
    } else if (isDryRun) {
      console.log('\nℹ️ DRY-RUN complete. To apply cleanup of confirmed orphaned rows, run:');
      console.log('   pnpm exec tsx scripts/cleanup-orphaned-users.js --apply\n');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
