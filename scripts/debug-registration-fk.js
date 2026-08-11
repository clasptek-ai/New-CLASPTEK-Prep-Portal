const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function traceRegistrationPipeline() {
  console.log('=================================================================');
  console.log('REGISTRATION PIPELINE & FK CONSTRAINTS FORENSIC TRACE');
  console.log('=================================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const dbUrl = process.env.DATABASE_URL || '';

  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Database URL (redacted): ${dbUrl.replace(/:[^:@]+@/, ':****@')}\n`);

  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  // 1. Inspect FK Constraints on public.users
  const fkRes = await pool.query(`
    SELECT
      conname,
      conrelid::regclass AS source_table,
      confrelid::regclass AS target_table,
      pg_get_constraintdef(oid) AS constraint_def
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass OR confrelid = 'public.users'::regclass
  `);
  console.log('Foreign Keys involving public.users:');
  console.table(fkRes.rows);

  // 2. Perform test API registration request
  const testEmail = `test_api_reg_${Date.now()}@clasptek.org`;
  const testPassword = 'Password123!';

  console.log(`\nTesting POST /api/v1/auth/register for ${testEmail}...`);
  try {
    const res = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'Candidate',
        programme: 'IELTS Academic',
      }),
    });
    const json = await res.json();
    console.log(`API Response Status (${res.status}):`, JSON.stringify(json, null, 2));

    if (json.userId) {
      const userId = json.userId;
      await pool.query('DELETE FROM public.profiles WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM public.security_profiles WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM public.identities WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM public.users WHERE id = $1', [userId]);
      await pool.query('DELETE FROM auth.users WHERE id = $1', [userId]);
      console.log('\nCleaned up API test user.');
    }
  } catch (err) {
    console.error('API request error:', err);
  }

  await pool.end();
}

traceRegistrationPipeline().catch((err) => console.error(err));
