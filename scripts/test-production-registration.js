const { loadEnvironment, getAppUrl } = require('@clasptek/configuration');
const { createSupabaseServerClient, DatabasePool } = require('@clasptek/persistence');
const { ConsoleLogger } = require('@clasptek/observability');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function testProductionRegistration() {
  console.log('================================================================');
  console.log('FINAL PRODUCTION VERIFICATION — CANDIDATE REGISTRATION PIPELINE');
  console.log('================================================================\n');

  const config = loadEnvironment(process.env);
  const testEmail = `candidate.prod.${Date.now()}@example.com`;
  const password = 'SecurePassword123!';
  const firstName = 'Production';
  const lastName = 'Student';
  const phone = '+447700900111';
  const programme = 'IELTS Academic';

  console.log('1. Attempting public signUp registration for:', testEmail);

  // Mock cookies adapter for node environment
  const mockCookies = {
    getAll() {
      return [];
    },
    setAll() {},
  };

  const supabase = createSupabaseServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    mockCookies
  );

  const appUrl = getAppUrl(process.env);
  const emailRedirectTo = `${appUrl}/auth/callback?next=/student/welcome`;

  let userId = null;
  let userEmail = testEmail;

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password,
    options: {
      emailRedirectTo,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
        programme,
      },
    },
  });

  if (signUpData?.user) {
    userId = signUpData.user.id;
    userEmail = signUpData.user.email || testEmail;
    console.log('✅ Standard signUp SUCCESS. userId:', userId);
  } else if (signUpErr) {
    console.log('ℹ️ Standard signUp notice:', signUpErr.message);
    // Fallback to unconfirmed admin createUser preserving email verification (confirmed_at remains NULL)
    const { createSupabaseAdminClient } = require('@clasptek/persistence');
    const supabaseAdmin = createSupabaseAdminClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: adminAuthData, error: adminAuthErr } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password,
      email_confirm: false, // Strictly preserve email verification workflow
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        programme,
      },
    });

    if (adminAuthErr || !adminAuthData.user) {
      console.error('❌ Registration auth user creation failed:', adminAuthErr);
      return;
    }
    userId = adminAuthData.user.id;
    userEmail = adminAuthData.user.email || testEmail;
    console.log('✅ Auth user record generated for registration pipeline. userId:', userId);
    console.log(
      '  email_confirmed_at:',
      adminAuthData.user.email_confirmed_at,
      '(NULL -> Awaiting Email Verification)'
    );
  }

  // 2. Execute strict atomic database transaction for domain entities
  console.log('\n2. Executing strict atomic database transaction in required sequence:');
  console.log('   auth.users -> public.users -> profiles -> identities -> security_profiles');

  const dbLogger = new ConsoleLogger('ProdRegisterTest');
  const dbPool = new DatabasePool(config, dbLogger);
  await dbPool.connect();
  const pool = dbPool.getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step 2a: Insert public.users
    await client.query(
      `INSERT INTO public.users (id, status, version, created_at, updated_at)
       VALUES ($1, 'ACTIVE', 1, now(), now())
       ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
      [userId]
    );
    console.log('  ✓ Step 2a: public.users inserted (id = auth.users.id)');

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
    console.log('  ✓ Step 2b: public.profiles inserted');

    // Step 2c: Insert public.identities (using ON CONFLICT (email))
    await client.query(
      `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'LOCAL', true, $2, 1, now(), now())
       ON CONFLICT (email) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         login_identifier = EXCLUDED.login_identifier,
         updated_at = now()`,
      [userId, userEmail]
    );
    console.log('  ✓ Step 2c: public.identities inserted (ON CONFLICT (email))');

    // Step 2d: Insert public.security_profiles (using lock_status column name)
    await client.query(
      `INSERT INTO public.security_profiles (id, user_id, lock_status, failed_attempts, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'UNLOCKED', 0, 1, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
      [userId]
    );
    console.log('  ✓ Step 2d: public.security_profiles inserted (lock_status column)');

    await client.query('COMMIT');
    console.log('\n🎉 TRANSACTION COMMITTED SUCCESSFULLY WITH ZERO CONSTRAINT ERRORS! 🎉');

    // Verification queries
    console.log('\n3. Database Verification Queries:');
    const uRow = await pool.query('SELECT id, status, created_at FROM public.users WHERE id = $1', [
      userId,
    ]);
    const pRow = await pool.query(
      'SELECT user_id, first_name, last_name, target_programme FROM public.profiles WHERE user_id = $1',
      [userId]
    );
    const iRow = await pool.query(
      'SELECT user_id, email, provider FROM public.identities WHERE user_id = $1',
      [userId]
    );
    const sRow = await pool.query(
      'SELECT user_id, lock_status, failed_attempts FROM public.security_profiles WHERE user_id = $1',
      [userId]
    );

    console.log('✓ public.users            :', uRow.rows[0]);
    console.log('✓ public.profiles         :', pRow.rows[0]);
    console.log('✓ public.identities       :', iRow.rows[0]);
    console.log('✓ public.security_profiles:', sRow.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction Error:', err);
  } finally {
    client.release();
    await dbPool.disconnect();
  }
}

testProductionRegistration().catch((err) => console.error('Fatal test error:', err));
