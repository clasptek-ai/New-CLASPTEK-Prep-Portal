const { loadEnvironment, getAppUrl } = require('@clasptek/configuration');
const { createSupabaseServerClient, DatabasePool } = require('@clasptek/persistence');
const { ConsoleLogger } = require('@clasptek/observability');
require('dotenv').config({ path: 'c:/Users/CLASPTEK/New CLASPTEK Prep Portal/.env.local' });

async function investigateSignUp() {
  console.log('=====================================================');
  console.log('FORENSIC INVESTIGATION: Supabase auth.signUp() Flow');
  console.log('=====================================================\n');

  const config = loadEnvironment(process.env);
  const testEmail = `candidate.${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  const firstName = 'Forensic';
  const lastName = 'Candidate';
  const phone = '+447999888777';
  const programme = 'IELTS Academic';

  console.log('NEXT_PUBLIC_SUPABASE_URL:', config.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!config.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // 1. Direct HTTP fetch call to Supabase /auth/v1/signup to capture raw error body
  console.log('\n--- 1. Testing Raw HTTP POST to Supabase Auth API ---');
  try {
    const rawRes = await fetch(`${config.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: testEmail,
        password: password,
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          programme: programme,
        },
        gotrue_meta_security: {},
      }),
    });

    const status = rawRes.status;
    const bodyText = await rawRes.text();
    console.log(`Raw HTTP Response Status: ${status}`);
    console.log(`Raw HTTP Response Body  : ${bodyText}`);

    try {
      const parsed = JSON.parse(bodyText);
      console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
  } catch (httpErr) {
    console.error('Raw HTTP Fetch Error:', httpErr);
  }

  // 2. Testing via Supabase Server Client
  console.log('\n--- 2. Testing via createSupabaseServerClient ---');
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
  } else {
    console.log('✅ supabase.auth.signUp SUCCESS!');
    console.log('Returned data.user.id:', data?.user?.id);
    console.log(
      'Returned data.session:',
      data?.session ? 'Session created' : 'No session (email confirmation required)'
    );

    // Check if auth.users record exists in database immediately
    const dbLogger = new ConsoleLogger('SignUpTest');
    const dbPool = new DatabasePool(config, dbLogger);
    await dbPool.connect();
    const pool = dbPool.getPool();

    const authCheck = await pool.query(
      'SELECT id, email, confirmed_at, created_at FROM auth.users WHERE id = $1',
      [data.user.id]
    );
    console.log('auth.users row in DB:', authCheck.rows[0]);
    await dbPool.disconnect();
  }
}

investigateSignUp().catch((err) => console.error('Fatal investigation error:', err));
