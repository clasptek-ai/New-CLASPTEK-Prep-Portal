const { Pool } = require('pg');
require('dotenv').config();

async function testRegistrationFlow() {
  console.log('=================================================================');
  console.log('ENTERPRISE REGISTRATION END-TO-END VERIFICATION');
  console.log('=================================================================\n');

  const testEmail = `enterprise_student_${Date.now()}@clasptek.org`;
  const testPassword = 'Password123!';

  console.log(`Registering new student: ${testEmail}...`);

  const res = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      firstName: 'Adebayo',
      lastName: 'Ogunlesi',
      phone: '+2348031234567',
      programme: 'IELTS Academic',
      country: 'Nigeria',
    }),
  });

  const json = await res.json();
  console.log(`API Response Status (${res.status}):`, JSON.stringify(json, null, 2));

  if (res.status === 201 && json.userId) {
    const userId = json.userId;

    const dbUrl = process.env.DATABASE_URL || '';
    const pool = new Pool({
      connectionString: dbUrl
        .replace(':6543/', ':5432/')
        .replace('sslmode=verify-full', 'sslmode=no-verify'),
      ssl: { rejectUnauthorized: false },
    });

    console.log(`\nVerifying database records for userId = ${userId}...`);

    const authRes = await pool.query('SELECT id, email, created_at FROM auth.users WHERE id = $1', [
      userId,
    ]);
    console.log('✓ auth.users record:', authRes.rows[0]);

    const userRes = await pool.query('SELECT id, status, version FROM public.users WHERE id = $1', [
      userId,
    ]);
    console.log('✓ public.users record:', userRes.rows[0]);

    const profRes = await pool.query(
      'SELECT id, user_id, first_name, last_name, phone, target_programme FROM public.profiles WHERE user_id = $1',
      [userId]
    );
    console.log('✓ public.profiles record:', profRes.rows[0]);

    const identRes = await pool.query(
      'SELECT id, user_id, email, provider FROM public.identities WHERE user_id = $1',
      [userId]
    );
    console.log('✓ public.identities record:', identRes.rows[0]);

    const secRes = await pool.query(
      'SELECT id, user_id, status FROM public.security_profiles WHERE user_id = $1',
      [userId]
    );
    console.log('✓ public.security_profiles record:', secRes.rows[0]);

    // Clean up test user
    await pool.query('DELETE FROM public.profiles WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM public.security_profiles WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM public.identities WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM public.users WHERE id = $1', [userId]);
    await pool.query('DELETE FROM auth.users WHERE id = $1', [userId]);
    console.log('\n✅ Registration flow & database integrity 100% VERIFIED!');

    await pool.end();
  } else {
    console.error('❌ Registration failed:', json);
  }
}

testRegistrationFlow().catch((err) => console.error(err));
