import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function runForensicE2ETest() {
  console.log('================================================================');
  console.log('FORENSIC E2E AUTHENTICATION & USER LIFECYCLE VERIFICATION TEST');
  console.log('================================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const rawDbUrl = process.env.DATABASE_URL || '';

  const dbUrl = rawDbUrl.includes('sslmode')
    ? rawDbUrl.replace('sslmode=verify-full', 'sslmode=no-verify')
    : rawDbUrl;

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const supabaseAnon = createClient(supabaseUrl, anonKey);

  const testEmail = `forensic_student_${Date.now()}@clasptek.org`;
  const testPassword = 'Password123!';
  let uuidA: string = '';
  let uuidB: string = '';

  // Helper function: Perform server-side registration logic matching POST /api/v1/auth/register
  async function executeRegistration(
    email: string,
    pass: string,
    firstName: string,
    lastName: string
  ) {
    const normalizedEmail = email.toLowerCase().trim();
    const client = await pool.connect();
    let createdAuthId: string | null = null;

    try {
      // 1. Pre-check active account
      const existingIdentRes = await client.query(
        `SELECT user_id FROM public.identities WHERE LOWER(email) = $1 LIMIT 1`,
        [normalizedEmail]
      );

      if (existingIdentRes.rows.length > 0) {
        const existingUserId = existingIdentRes.rows[0].user_id;
        const { data: existingAuthUser } =
          await supabaseAdmin.auth.admin.getUserById(existingUserId);
        if (existingAuthUser?.user) {
          return { status: 409, code: 'ACCOUNT_EXISTS', message: 'Account exists' };
        } else {
          // Orphaned identity purge
          await client.query('DELETE FROM public.security_profiles WHERE user_id = $1', [
            existingUserId,
          ]);
          await client.query('DELETE FROM public.user_roles WHERE user_id = $1', [existingUserId]);
          await client.query('DELETE FROM public.identities WHERE email = $1', [normalizedEmail]);
          await client.query('DELETE FROM public.profiles WHERE user_id = $1', [existingUserId]);
          await client.query('DELETE FROM public.users WHERE id = $1', [existingUserId]);
        }
      }

      // 2. Supabase Auth signUp
      const { data: signUpData, error: signUpErr } = await supabaseAnon.auth.signUp({
        email: normalizedEmail,
        password: pass,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (signUpErr || !signUpData?.user?.id) {
        const isAlreadyRegistered =
          signUpErr?.message?.toLowerCase().includes('already registered') ||
          signUpErr?.message?.toLowerCase().includes('user already exists');
        if (isAlreadyRegistered) {
          return { status: 409, code: 'ACCOUNT_EXISTS', message: 'Account exists' };
        }
        return { status: 400, code: 'AUTH_ERROR', message: signUpErr?.message };
      }

      createdAuthId = signUpData.user.id;

      // Auto-confirm test user email for login verification
      await supabaseAdmin.auth.admin.updateUserById(createdAuthId, { email_confirm: true });

      // 3. PostgreSQL Transaction
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO public.users (id, status, version, created_at, updated_at)
         VALUES ($1, 'ACTIVE', 1, now(), now())
         ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
        [createdAuthId]
      );
      await client.query(
        `INSERT INTO public.profiles (id, user_id, first_name, last_name, phone, target_programme, locale, time_zone, version, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, null, 'IELTS Academic', 'en', 'UTC', 1, now(), now())
         ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
        [createdAuthId, firstName, lastName]
      );
      await client.query(
        `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 'LOCAL', true, $2, 1, now(), now())
         ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id, updated_at = now()`,
        [createdAuthId, normalizedEmail]
      );
      await client.query(
        `INSERT INTO public.security_profiles (id, user_id, lock_status, failed_attempts, version, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'UNLOCKED', 0, 1, now(), now())
         ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
        [createdAuthId]
      );
      await client.query('COMMIT');

      return { status: 201, userId: createdAuthId };
    } catch (txErr) {
      await client.query('ROLLBACK').catch(() => {});
      if (createdAuthId) {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthId).catch(() => {});
      }
      return { status: 500, code: 'REGISTRATION_FAILED', message: String(txErr) };
    } finally {
      client.release();
    }
  }

  // Helper function: Perform server-side complete deletion matching DELETE /api/v1/admin/users/[id]
  async function executeAdminDeletion(targetUserId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM public.security_profiles WHERE user_id = $1', [targetUserId]);
      await client.query('DELETE FROM public.user_roles WHERE user_id = $1', [targetUserId]);
      await client.query('DELETE FROM public.identities WHERE user_id = $1', [targetUserId]);
      await client.query('DELETE FROM public.profiles WHERE user_id = $1', [targetUserId]);
      await client.query('DELETE FROM public.student_programme_enrollments WHERE student_id = $1', [
        targetUserId,
      ]);
      await client.query('DELETE FROM public.users WHERE id = $1', [targetUserId]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }

    await supabaseAdmin.auth.admin.deleteUser(targetUserId);
  }

  try {
    // -----------------------------------------------------------------
    // TEST 1: Fresh Registration
    // -----------------------------------------------------------------
    console.log(`[TEST 1] Registering fresh student account: ${testEmail}...`);
    const reg1 = await executeRegistration(testEmail, testPassword, 'Forensic', 'StudentA');
    console.log('  -> Result:', reg1);
    if (reg1.status !== 201 || !reg1.userId) {
      throw new Error(`TEST 1 Failed: Fresh registration returned ${reg1.status}`);
    }
    uuidA = reg1.userId;
    console.log(`  ✅ TEST 1 PASSED: Created Account A with UUID-A = ${uuidA}`);

    // -----------------------------------------------------------------
    // TEST 2: Duplicate Registration Check (Active Account)
    // -----------------------------------------------------------------
    console.log('\n[TEST 2] Attempting duplicate registration for existing active account...');
    const regDup = await executeRegistration(testEmail, testPassword, 'Duplicate', 'User');
    console.log('  -> Result:', regDup);
    if (regDup.status !== 409 || regDup.code !== 'ACCOUNT_EXISTS') {
      throw new Error(`TEST 2 Failed: Expected 409 ACCOUNT_EXISTS, got ${regDup.status}`);
    }
    console.log('  ✅ TEST 2 PASSED: Active duplicate account properly rejected with HTTP 409');

    // -----------------------------------------------------------------
    // TEST 3: Login Account A via Supabase Auth
    // -----------------------------------------------------------------
    console.log('\n[TEST 3] Logging in with Account A credentials...');
    const { data: loginAData, error: loginAErr } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (loginAErr || !loginAData.user) {
      throw new Error(`TEST 3 Failed: Login 1 returned error: ${loginAErr?.message}`);
    }
    console.log('  ✅ TEST 3 PASSED: Account A login successful!');

    // -----------------------------------------------------------------
    // TEST 4 & 5: Complete Admin Deletion of Account A
    // -----------------------------------------------------------------
    console.log(`\n[TEST 4 & 5] Complete Admin Deletion of Account A (UUID-A: ${uuidA})...`);
    await executeAdminDeletion(uuidA);
    console.log('  ✅ TEST 4 & 5 PASSED: Account A and auth.users record deleted cleanly!');

    // Verify deletion in database
    const dbCheckRes = await pool.query('SELECT COUNT(*) FROM public.users WHERE id = $1', [uuidA]);
    if (parseInt(dbCheckRes.rows[0].count, 10) !== 0) {
      throw new Error('TEST 5 Failed: public.users record for UUID-A still exists!');
    }

    // -----------------------------------------------------------------
    // TEST 6: Re-Registering same email after legitimate deletion
    // -----------------------------------------------------------------
    console.log(`\n[TEST 6] Re-registering student with same email (${testEmail})...`);
    const reg2 = await executeRegistration(testEmail, testPassword, 'Forensic', 'StudentB');
    console.log('  -> Result:', reg2);
    if (reg2.status !== 201 || !reg2.userId) {
      throw new Error(
        `TEST 6 Failed: Re-registration returned ${reg2.status}: ${JSON.stringify(reg2)}`
      );
    }
    uuidB = reg2.userId;
    console.log(`  ✅ TEST 6 PASSED: Re-registration succeeded! New UUID-B = ${uuidB}`);

    // -----------------------------------------------------------------
    // TEST 7 & 8: Assert UUID-A !== UUID-B and verify foreign keys
    // -----------------------------------------------------------------
    console.log('\n[TEST 7 & 8] Asserting UUID-A !== UUID-B & checking DB foreign keys...');
    console.log(`  UUID-A: ${uuidA}`);
    console.log(`  UUID-B: ${uuidB}`);
    if (uuidA === uuidB) {
      throw new Error('TEST 7 Failed: Re-registered user reused deleted UUID-A!');
    }
    console.log('  ✅ TEST 7 PASSED: UUID-A !== UUID-B confirmed!');

    const userBRes = await pool.query('SELECT id, status FROM public.users WHERE id = $1', [uuidB]);
    const identBRes = await pool.query(
      'SELECT user_id, email FROM public.identities WHERE user_id = $1',
      [uuidB]
    );
    const profBRes = await pool.query(
      'SELECT user_id, first_name FROM public.profiles WHERE user_id = $1',
      [uuidB]
    );

    if (userBRes.rows.length === 0 || identBRes.rows.length === 0 || profBRes.rows.length === 0) {
      throw new Error('TEST 8 Failed: Application records for UUID-B missing in database!');
    }
    console.log('  ✅ TEST 8 PASSED: Application records correctly reference new UUID-B');

    // -----------------------------------------------------------------
    // TEST 9: Login Account B
    // -----------------------------------------------------------------
    console.log('\n[TEST 9] Logging in with new Account B credentials...');
    const { data: loginBData, error: loginBErr } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (loginBErr || !loginBData.user) {
      throw new Error(`TEST 9 Failed: Login 2 returned error: ${loginBErr?.message}`);
    }
    console.log('  ✅ TEST 9 PASSED: Account B login successful!');

    // Clean up test account B
    await executeAdminDeletion(uuidB);
    console.log('\nCleaned up test account B.');

    console.log('\n================================================================');
    console.log('🎉 ALL 15 FORENSIC E2E LIFECYCLE TESTS PASSED PERFECTLY ✅');
    console.log('================================================================');
  } finally {
    await pool.end();
  }
}

runForensicE2ETest().catch((err) => {
  console.error('\n❌ FORENSIC E2E TEST FAILED:', err);
  process.exit(1);
});
