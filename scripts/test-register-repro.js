const { loadEnvironment, getAppUrl } = require('@clasptek/configuration');
const { createSupabaseServerClient, DatabasePool } = require('@clasptek/persistence');
const { ConsoleLogger } = require('@clasptek/observability');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function testRegistrationRepro() {
  console.log('--- REPRODUCING REGISTRATION FLOW ---');

  const config = loadEnvironment(process.env);
  const testEmail = `test.student.${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  const firstName = 'Test';
  const lastName = 'Candidate';
  const phone = '+447000000000';
  const programme = 'IELTS Academic';

  console.log('1. Calling supabase.auth.signUp for:', testEmail);

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

  const emailRedirectTo = `http://localhost:3000/auth/callback?next=/student/welcome`;

  const { data, error } = await supabase.auth.signUp({
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

  if (error) {
    console.error('❌ supabase.auth.signUp returned error:', error);
    return;
  }

  if (!data.user) {
    console.error('❌ supabase.auth.signUp returned no user object');
    return;
  }

  const userId = data.user.id;
  console.log('✅ supabase.auth.signUp SUCCESS. Returned userId:', userId);
  console.log('User identities:', data.user.identities);

  // Check if auth.users row exists right now in database via direct PG client
  const dbLogger = new ConsoleLogger('RegisterTest');
  const dbPool = new DatabasePool(config, dbLogger);
  await dbPool.connect();
  const pool = dbPool.getPool();

  const authUserCheck = await pool.query(
    'SELECT id, email, created_at FROM auth.users WHERE id = $1',
    [userId]
  );
  console.log(
    'Is auth.users record in database immediately after signUp?',
    authUserCheck.rows.length > 0 ? 'YES ✅' : 'NO ❌'
  );
  if (authUserCheck.rows.length > 0) {
    console.log('auth.users row:', authUserCheck.rows[0]);
  }

  // Attempting transaction insert into public.users
  console.log('2. Attempting transaction INSERT INTO public.users...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO public.users (id, status, version, created_at, updated_at)
       VALUES ($1, 'ACTIVE', 1, now(), now())
       ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
      [userId]
    );

    console.log('✅ INSERT INTO public.users SUCCESS!');

    await client.query(
      `INSERT INTO public.profiles (id, user_id, first_name, last_name, phone, target_programme, locale, time_zone, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'en', 'UTC', 1, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
      [userId, firstName, lastName, phone, programme]
    );
    console.log('✅ INSERT INTO public.profiles SUCCESS!');

    await client.query(
      `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'LOCAL', true, $2, 1, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
      [userId, testEmail]
    );
    console.log('✅ INSERT INTO public.identities SUCCESS!');

    await client.query(
      `INSERT INTO public.security_profiles (id, user_id, status, failed_attempts, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'UNLOCKED', 0, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
      [userId]
    );
    console.log('✅ INSERT INTO public.security_profiles SUCCESS!');

    await client.query('COMMIT');
    console.log('🎉 REGISTRATION TRANSACTION COMMITTED SUCCESSFULLY!');
  } catch (txErr) {
    await client.query('ROLLBACK');
    console.error('❌ TRANSACTION FAILED WITH ERROR:', txErr);
  } finally {
    client.release();
    await dbPool.disconnect();
  }
}

testRegistrationRepro().catch((err) => console.error('Fatal test error:', err));
