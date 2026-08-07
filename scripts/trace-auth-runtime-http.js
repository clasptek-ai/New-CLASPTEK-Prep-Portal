const http = require('http');
const https = require('https');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function runRuntimeTrace() {
  console.log('=================================================================');
  console.log('RUNTIME AUTHENTICATION HTTP TRACE & COOKIE PERSISTENCE AUDIT');
  console.log('=================================================================\n');

  // 1. Fetch Supabase Auth Configuration & Admin User
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('1. INITIALIZING AUTHENTICATION TARGET...');
  console.log(`   - Supabase URL: ${supabaseUrl}`);
  console.log(`   - Dev Server  : http://localhost:3000\n`);

  // Find or create test user for recovery trace
  const userRes = await pool.query(
    "SELECT id, email FROM auth.users WHERE email LIKE '%@clasptek.ai' OR email LIKE '%@gmail.com' LIMIT 1"
  );
  let testUser = userRes.rows[0];

  if (!testUser) {
    console.log('   No test user found in auth.users, creating temporary auth user...');
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email: 'runtime_auth_trace@clasptek.ai',
        password: 'Password123!',
        email_confirm: true,
      }),
    }).then((r) => r.json());

    testUser = { id: createRes.id, email: createRes.email };
  }

  console.log(`   - Test User ID   : ${testUser.id}`);
  console.log(`   - Test User Email: ${testUser.email}\n`);

  // 2. Generate Recovery Link via Supabase Admin API
  console.log('2. GENERATING SUPABASE RECOVERY LINK...');
  const recoveryRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      type: 'recovery',
      email: testUser.email,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback?next=/reset-password',
      },
    }),
  }).then((r) => r.json());

  console.log(`   - Action Link Generated : ${recoveryRes.action_link}`);
  console.log(`   - Hashed Token          : ${recoveryRes.hashed_token}`);
  console.log(`   - Redirect URL          : ${recoveryRes.redirect_to}\n`);

  const actionUrl = new URL(recoveryRes.action_link);
  const tokenHash = actionUrl.searchParams.get('token');

  // 3. STEP 1: GET /auth/callback Runtime HTTP Trace
  console.log('-----------------------------------------------------------------');
  console.log('STEP 1: GET /auth/callback RUNTIME HTTP TRACE');
  console.log('-----------------------------------------------------------------');

  const callbackUrl = `http://localhost:3000/auth/callback?token_hash=${tokenHash}&type=recovery&next=/reset-password`;
  console.log(`Executing: GET ${callbackUrl}\n`);

  const callbackRes = await fetch(callbackUrl, {
    method: 'GET',
    redirect: 'manual',
  });

  const callbackStatus = callbackRes.status;
  const callbackLocation = callbackRes.headers.get('location');
  const setCookieHeader = callbackRes.headers.getSetCookie();

  console.log(`- Response Status  : ${callbackStatus}`);
  console.log(`- Redirect Location: ${callbackLocation}`);
  console.log(`- Set-Cookie Count : ${setCookieHeader.length}`);
  console.log(`- Set-Cookie Headers:`);
  setCookieHeader.forEach((c, idx) => {
    console.log(`   [${idx + 1}] ${c}`);
  });
  console.log('');

  // Extract Cookie Name & Value pairs for subsequent HTTP requests
  const cookiePairs = setCookieHeader.map((c) => c.split(';')[0].trim());
  const cookieHeaderValue = cookiePairs.join('; ');

  console.log(`Extracted Request Cookie Header: "${cookieHeaderValue}"\n`);

  // 4. STEP 2: GET /api/v1/auth/session Immediately After Redirect
  console.log('-----------------------------------------------------------------');
  console.log('STEP 2: GET /api/v1/auth/session RUNTIME HTTP TRACE');
  console.log('-----------------------------------------------------------------');

  const sessionRes = await fetch('http://localhost:3000/api/v1/auth/session', {
    method: 'GET',
    headers: {
      Cookie: cookieHeaderValue,
    },
  });

  const sessionStatus = sessionRes.status;
  const sessionBody = await sessionRes.json();

  console.log(`- Response Status: ${sessionStatus}`);
  console.log(`- Response Body  :`, JSON.stringify(sessionBody, null, 2));
  console.log(`- Session Active : ${sessionBody.success === true && Boolean(sessionBody.user)}`);
  console.log('');

  // 5. STEP 3: POST /api/v1/auth/reset-password Trace
  console.log('-----------------------------------------------------------------');
  console.log('STEP 3: POST /api/v1/auth/reset-password RUNTIME HTTP TRACE');
  console.log('-----------------------------------------------------------------');

  const resetRes = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeaderValue,
    },
    body: JSON.stringify({
      password: 'TraceNewPassword123!',
    }),
  });

  const resetStatus = resetRes.status;
  const resetBody = await resetRes.json();

  console.log(`- Response Status: ${resetStatus}`);
  console.log(`- Response Body  :`, JSON.stringify(resetBody, null, 2));
  console.log('');

  // 6. Cookie Attributes Inspection (Secure, SameSite, Path, Domain)
  console.log('-----------------------------------------------------------------');
  console.log('STEP 4: COOKIE ATTRIBUTES FORENSIC ANALYSIS');
  console.log('-----------------------------------------------------------------');

  setCookieHeader.forEach((cookieStr, i) => {
    console.log(`Cookie [${i + 1}]:`);
    const parts = cookieStr.split(';').map((p) => p.trim());
    const nameValue = parts[0];
    const attributes = parts.slice(1);

    console.log(`  Name=Value: ${nameValue}`);
    console.log(`  Attributes:`);
    attributes.forEach((attr) => console.log(`    - ${attr}`));

    // Check specific security flags
    const hasPath = attributes.some((a) => a.toLowerCase().startsWith('path='));
    const hasSameSite = attributes.some((a) => a.toLowerCase().startsWith('samesite='));
    const hasSecure = attributes.some((a) => a.toLowerCase() === 'secure');

    if (!hasPath) console.warn('  ⚠️ WARNING: Path attribute is missing!');
    if (!hasSameSite) console.warn('  ⚠️ WARNING: SameSite attribute is missing!');
    if (process.env.NODE_ENV === 'production' && !hasSecure) {
      console.warn('  ⚠️ WARNING: Secure flag is missing in production!');
    }
  });

  console.log('\n=================================================================');
  console.log('RUNTIME TRACE EXECUTION COMPLETE');
  console.log('=================================================================\n');

  await pool.end();
}

runRuntimeTrace().catch((err) => {
  console.error('❌ Runtime trace execution failed:', err);
  process.exit(1);
});
