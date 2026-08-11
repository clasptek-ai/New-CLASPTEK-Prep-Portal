const { loadEnvironment } = require('@clasptek/configuration');
const { createSupabaseAdminClient, DatabasePool } = require('@clasptek/persistence');
const { ConsoleLogger } = require('@clasptek/observability');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function testAdminCreateUser() {
  console.log('--- TESTING COMPLETE REGISTRATION PIPELINE ---');

  const config = loadEnvironment(process.env);
  const testEmail = `test.student.${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  const firstName = 'Test';
  const lastName = 'Candidate';
  const phone = '+447000000000';
  const programme = 'IELTS Academic';

  console.log('SUPABASE_SERVICE_ROLE_KEY present:', !!config.SUPABASE_SERVICE_ROLE_KEY);

  const supabaseAdmin = createSupabaseAdminClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('1. Calling supabaseAdmin.auth.admin.createUser for:', testEmail);

  const { data: authData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone,
      programme,
    },
  });

  if (createErr) {
    console.error('❌ createUser returned error:', createErr);
    return;
  }

  if (!authData.user) {
    console.error('❌ createUser returned no user object');
    return;
  }

  const userId = authData.user.id;
  console.log('✅ createUser SUCCESS. Returned userId:', userId);

  // Check if auth.users row exists in database via direct PG client
  const dbLogger = new ConsoleLogger('RegisterTest');
  const dbPool = new DatabasePool(config, dbLogger);
  await dbPool.connect();
  const pool = dbPool.getPool();

  const authUserCheck = await pool.query(
    'SELECT id, email, created_at FROM auth.users WHERE id = $1',
    [userId]
  );
  console.log(
    'Is auth.users record in database immediately after createUser?',
    authUserCheck.rows.length > 0 ? 'YES ✅' : 'NO ❌'
  );

  // Attempting transaction insert into public.users
  console.log('2. Attempting transaction INSERT INTO public.users...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Step 2a: Insert public.users (referenced by fk_users_id -> auth.users)
    await client.query(
      `INSERT INTO public.users (id, status, version, created_at, updated_at)
       VALUES ($1, 'ACTIVE', 1, now(), now())
       ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
      [userId]
    );
    console.log('✅ 2a. INSERT INTO public.users SUCCESS!');

    // Step 2b: Insert public.profiles
    await client.query(
      `INSERT INTO public.profiles (id, user_id, first_name, last_name, phone, target_programme, locale, time_zone, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'en', 'UTC', 1, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET
         first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
         last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
         phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
         target_programme = COALESCE(EXCLUDED.target_programme, public.profiles.target_programme),
         updated_at = now()`,
      [userId, firstName, lastName, phone, programme]
    );
    console.log('✅ 2b. INSERT INTO public.profiles SUCCESS!');

    // Step 2c: Insert public.identities
    await client.query(
      `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'LOCAL', true, $2, 1, now(), now())
       ON CONFLICT (email) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         login_identifier = EXCLUDED.login_identifier,
         updated_at = now()`,
      [userId, testEmail]
    );
    console.log('✅ 2c. INSERT INTO public.identities SUCCESS!');

    // Step 2d: Insert public.security_profiles (using lock_status column)
    await client.query(
      `INSERT INTO public.security_profiles (id, user_id, lock_status, failed_attempts, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'UNLOCKED', 0, 1, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
      [userId]
    );
    console.log('✅ 2d. INSERT INTO public.security_profiles SUCCESS!');

    await client.query('COMMIT');
    console.log(
      '\n🎉🎉 REGISTRATION TRANSACTION COMMITTED SUCCESSFULLY WITH 0 CONSTRAINTS VIOLATIONS! 🎉🎉'
    );

    // Verify all tables contain records for this userId
    const checkPublicUsers = await pool.query('SELECT * FROM public.users WHERE id = $1', [userId]);
    const checkProfiles = await pool.query('SELECT * FROM public.profiles WHERE user_id = $1', [
      userId,
    ]);
    const checkIdentities = await pool.query('SELECT * FROM public.identities WHERE user_id = $1', [
      userId,
    ]);
    const checkSecurity = await pool.query(
      'SELECT * FROM public.security_profiles WHERE user_id = $1',
      [userId]
    );

    console.log('\n--- VERIFICATION OF INSERTED ENTITIES ---');
    console.log('public.users row count             :', checkPublicUsers.rows.length, '✅');
    console.log('public.profiles row count          :', checkProfiles.rows.length, '✅');
    console.log('public.identities row count        :', checkIdentities.rows.length, '✅');
    console.log('public.security_profiles row count :', checkSecurity.rows.length, '✅');
  } catch (txErr) {
    await client.query('ROLLBACK');
    console.error('❌ TRANSACTION FAILED WITH ERROR:', txErr);
  } finally {
    client.release();
    await dbPool.disconnect();
  }
}

testAdminCreateUser().catch((err) => console.error('Fatal test error:', err));
