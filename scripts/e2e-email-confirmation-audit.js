require('dotenv').config();
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('================================================================');
  console.log('    STEP 1 & STEP 2: AUTH CONFIG & EMAIL CONFIRMATION TRACE     ');
  console.log('================================================================\n');

  const testEmail = `audit.student.${Date.now()}@clasptek.org`;
  const testPassword = 'Password123!';

  console.log(`1. Registering new test candidate account: ${testEmail}...`);

  // Call local registration endpoint or Supabase admin create user
  const { data: signUpData, error: signUpErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: false,
    user_metadata: { first_name: 'Audit', last_name: 'TestStudent' },
  });

  if (signUpErr) {
    console.error('Registration failed:', signUpErr.message);
    process.exit(1);
  }

  const userId = signUpData.user.id;
  console.log(`✅ Candidate registered in Supabase auth.users (ID: ${userId})`);

  // Generate confirmation link as Supabase Auth does for emails
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: testEmail,
    options: {
      redirectTo: 'http://localhost:3000/auth/callback?next=/student/welcome',
    },
  });

  if (linkErr) {
    console.error('Link generation error:', linkErr.message);
    process.exit(1);
  }

  const actionLink = linkData.properties.action_link;
  const redirectUrl = linkData.properties.redirect_to;

  console.log('\n2. Generated Confirmation Email Link Properties:');
  console.log(` - Action Link: ${actionLink}`);
  console.log(` - Redirect To: ${redirectUrl}`);

  // Inspect link parameters
  const parsedActionUrl = new URL(actionLink);
  console.log(' - Action Link Token:', parsedActionUrl.searchParams.get('token'));
  console.log(' - Action Link Type:', parsedActionUrl.searchParams.get('type'));
  console.log(' - Action Link RedirectTo Param:', parsedActionUrl.searchParams.get('redirect_to'));

  // Test HTTP GET request on the action_link to trace HTTP redirect chain
  console.log('\n3. Tracing HTTP GET request on action_link...');
  try {
    const res = await fetch(actionLink, { redirect: 'manual' });
    console.log(` - HTTP Status: ${res.status}`);
    console.log(` - Location Header: ${res.headers.get('location')}`);
  } catch (fetchErr) {
    console.error('Fetch action_link error:', fetchErr.message);
  }

  // Check database email_confirmed_at state
  const dbCheck = await pool.query(
    'SELECT id, email, email_confirmed_at, confirmation_sent_at FROM auth.users WHERE id = $1',
    [userId]
  );

  console.log('\n4. Database User State After Link Trace:');
  console.table(dbCheck.rows);

  await pool.end();
}

main().catch((err) => {
  console.error('Audit Exception:', err);
  process.exit(1);
});
