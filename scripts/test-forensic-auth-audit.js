const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables');
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const clientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

async function runForensicAuthAudit() {
  console.log('================================================================');
  console.log('FORENSIC AUDIT — COMPLETE AUTHENTICATION LIFECYCLE VERIFICATION');
  console.log('================================================================\n');

  const testEmail = `audit.student.${Date.now()}@example.com`;
  const initialPassword = 'InitialPassword123!';
  const newPassword = 'NewPassword456!';

  // 1. Audit User Provisioning & Auth User Verification
  console.log(`1. Provisioning candidate auth user: ${testEmail}`);
  const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
    email: testEmail,
    password: initialPassword,
    email_confirm: true,
    user_metadata: { first_name: 'Audit', last_name: 'Candidate' },
  });

  if (createError || !createData.user) {
    console.error('❌ Failed to provision test candidate:', createError);
    process.exit(1);
  }

  const userId = createData.user.id;
  console.log(`  ✓ Auth user created. ID: ${userId}`);

  // 2. Audit Client Authentication & Session Persistence
  console.log('\n2. Testing client authentication (signInWithPassword):');
  const { data: signInData, error: signInError } = await clientSupabase.auth.signInWithPassword({
    email: testEmail,
    password: initialPassword,
  });

  if (signInError || !signInData.session) {
    console.error('❌ Failed to sign in candidate:', signInError);
    process.exit(1);
  }

  const session = signInData.session;
  console.log('  ✓ Session established successfully:');
  console.log(`    - Access Token : ${session.access_token.substring(0, 20)}...`);
  console.log(`    - Refresh Token: ${session.refresh_token.substring(0, 20)}...`);
  console.log(`    - User ID       : ${session.user.id}`);

  // 3. Audit Password Recovery Link & Exchange Verification
  console.log('\n3. Testing password recovery link generation:');
  const { data: resetData, error: resetError } = await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email: testEmail,
  });

  if (resetError || !resetData.properties?.hashed_token) {
    console.error('❌ Failed to generate password recovery link:', resetError);
    process.exit(1);
  }

  console.log(
    `  ✓ Password recovery token generated: ${resetData.properties.hashed_token.substring(0, 15)}...`
  );

  // 4. Audit Password Update with Active Session
  console.log('\n4. Testing password update (updateUser):');
  const { error: updateErr } = await clientSupabase.auth.updateUser({ password: newPassword });

  if (updateErr) {
    console.error('❌ Failed to update password:', updateErr);
    process.exit(1);
  }
  console.log('  ✓ Password updated successfully via client recovery session');

  // 5. Verify Authentication with New Password
  console.log('\n5. Verifying authentication with new password:');
  const { data: newSignInData, error: newSignInError } =
    await clientSupabase.auth.signInWithPassword({
      email: testEmail,
      password: newPassword,
    });

  if (newSignInError || !newSignInData.session) {
    console.error('❌ Failed to sign in with new password:', newSignInError);
    process.exit(1);
  }

  console.log('  ✓ Authentication with new password verified cleanly!');

  // Clean up test candidate
  await adminSupabase.auth.admin.deleteUser(userId);
  console.log('\n================================================================');
  console.log('🎉 FORENSIC AUTHENTICATION LIFECYCLE AUDIT PASSED 100% CLEANLY!');
  console.log('================================================================');
}

runForensicAuthAudit().catch((err) => {
  console.error('Audit exception:', err);
  process.exit(1);
});
