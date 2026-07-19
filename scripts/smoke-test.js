const { Client } = require('pg');
require('dotenv').config();

async function main() {
  console.log('=========================================');
  console.log('Platform Smoke Test: RLS & Integration');
  console.log('=========================================');

  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not configured.');
    process.exit(1);
  }
  dbUrl = dbUrl.replace('sslmode=verify-full', 'sslmode=no-verify');

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
  });
  try {
    await client.connect();
    console.log('Connected to database.');

    const mockUserId = '11111111-1111-1111-1111-111111111111';
    const mockEmail = 'smoketest@clasptek.com';
    const otherUserId = '22222222-2222-2222-2222-222222222222';

    console.log('\n1. Provisioning mock user aggregate (Bypassing RLS as admin)...');

    // Clean up any stale smoke test data
    await client.query('DELETE FROM users WHERE id IN ($1, $2)', [mockUserId, otherUserId]);

    // Insert user
    await client.query(`INSERT INTO users (id, status, version) VALUES ($1, 'ACTIVE', 1)`, [
      mockUserId,
    ]);

    // Insert identity
    await client.query(
      `INSERT INTO identities (user_id, email, provider, is_verified, login_identifier, version)
       VALUES ($1, $2, 'LOCAL', true, $2, 1)`,
      [mockUserId, mockEmail]
    );

    // Insert profile
    await client.query(
      `INSERT INTO profiles (user_id, first_name, last_name, locale, time_zone, version)
       VALUES ($1, 'Smoke', 'Tester', 'en', 'UTC', 1)`,
      [mockUserId]
    );

    console.log('✓ Mock user, identity, and profile provisioned.');

    console.log('\n2. Testing Row Level Security (RLS) policies...');

    // Test A: Anonymous / Unauthenticated access
    console.log('   Test A: Querying profiles with no authenticated claims context...');
    await client.query('SET ROLE anon');
    const anonRes = await client.query('SELECT * FROM profiles');
    await client.query('RESET ROLE');
    console.log(`   -> Found ${anonRes.rows.length} records. (Expected: 0 due to RLS filter)`);
    if (anonRes.rows.length !== 0) {
      throw new Error('RLS Failure: Anonymous query was not filtered.');
    }
    console.log('   ✓ Anonymous access restricted.');

    // Test B: Querying as the matching authenticated user
    console.log(`   Test B: Simulating claims for user ${mockUserId}...`);

    // We start a transaction to use SET LOCAL
    await client.query('BEGIN');
    await client.query('SET ROLE authenticated');

    // Emulate Supabase JWT claim sub context
    await client.query(`SET LOCAL request.jwt.claim.sub = '${mockUserId}'`);
    await client.query(`SET LOCAL request.jwt.claim.role = 'authenticated'`);

    const ownerRes = await client.query('SELECT * FROM profiles');
    await client.query('RESET ROLE');
    await client.query('COMMIT');

    console.log(`   -> Found ${ownerRes.rows.length} records. (Expected: 1)`);
    if (ownerRes.rows.length !== 1 || ownerRes.rows[0].user_id !== mockUserId) {
      throw new Error('RLS Failure: Own-record select failed.');
    }
    console.log('   ✓ Own-record selection succeeded.');

    // Test C: Querying as a different user
    console.log(`   Test C: Simulating claims for user ${otherUserId}...`);
    await client.query('BEGIN');
    await client.query('SET ROLE authenticated');
    await client.query(`SET LOCAL request.jwt.claim.sub = '${otherUserId}'`);
    await client.query(`SET LOCAL request.jwt.claim.role = 'authenticated'`);

    const crossRes = await client.query('SELECT * FROM profiles');
    await client.query('RESET ROLE');
    await client.query('COMMIT');

    console.log(`   -> Found ${crossRes.rows.length} records. (Expected: 0 due to RLS separation)`);
    if (crossRes.rows.length !== 0) {
      throw new Error('RLS Failure: Selected other user profile data.');
    }
    console.log('   ✓ User profile isolation verified.');

    // 3. Cleanup Test Data
    console.log('\n3. Cleaning up database smoke test data...');
    await client.query('DELETE FROM users WHERE id = $1', [mockUserId]);
    console.log('✓ Cleaned up test user data.');

    console.log('\n=========================================');
    console.log('✅ SMOKE TEST PASSED SUCCESSFULLY!');
    console.log('=========================================');
  } catch (err) {
    console.error('\n❌ SMOKE TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
