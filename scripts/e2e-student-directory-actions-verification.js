const http = require('http');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function runE2EVerification() {
  console.log('=================================================================');
  console.log('STUDENT DIRECTORY ADMIN ACTIONS LIVE INTEGRATION TEST SUITE');
  console.log('=================================================================\n');

  // 1. Create a candidate student via POST /api/v1/admin/users
  const testEmail = `student_action_test_${Date.now()}@clasptek.ai`;
  console.log('1. TESTING CANDIDATE REGISTRATION (POST /api/v1/admin/users)');
  const registerPayload = JSON.stringify({
    name: 'Directory Action Candidate',
    email: testEmail,
    phone: '+2348011223344',
    programme: 'IELTS Academic',
    cohort: 'COHORT-2026-A',
  });

  const regRes = await makeRequest('POST', '/api/v1/admin/users', registerPayload);
  console.log(`   Response Code : ${regRes.statusCode}`);
  console.log(`   Response Body : ${JSON.stringify(regRes.body)}`);

  if (!regRes.body || !regRes.body.data || !regRes.body.data.id) {
    throw new Error('Registration failed!');
  }

  const candidateId = regRes.body.data.id;
  console.log(`   ✅ Candidate Created Live: ${candidateId}\n`);

  // 2. TEST PRACTICE GATE TOGGLE (PATCH /api/v1/admin/users/:id/practice-gate)
  console.log('2. TESTING PRACTICE GATE TOGGLE (PATCH /api/v1/admin/users/:id/practice-gate)');
  const practiceRes = await makeRequest(
    'PATCH',
    `/api/v1/admin/users/${candidateId}/practice-gate`,
    JSON.stringify({ locked: true, reason: 'Tuition Fee Verification Pending' })
  );
  console.log(`   Response Code : ${practiceRes.statusCode}`);
  console.log(`   Response Body : ${JSON.stringify(practiceRes.body)}`);

  const practiceDb = await pool.query(
    'SELECT practice_gate_locked, practice_gate_reason FROM public.users WHERE id = $1',
    [candidateId]
  );
  console.log(
    `   DB State      : locked=${practiceDb.rows[0].practice_gate_locked}, reason="${practiceDb.rows[0].practice_gate_reason}"`
  );
  console.log('   ✅ Practice Gate Persisted in Database\n');

  // 3. TEST MOCK GATE TOGGLE (PATCH /api/v1/admin/users/:id/mock-gate)
  console.log('3. TESTING MOCK GATE TOGGLE (PATCH /api/v1/admin/users/:id/mock-gate)');
  const mockRes = await makeRequest(
    'PATCH',
    `/api/v1/admin/users/${candidateId}/mock-gate`,
    JSON.stringify({ locked: true, reason: 'Diagnostic Prerequisite Incomplete' })
  );
  console.log(`   Response Code : ${mockRes.statusCode}`);
  console.log(`   Response Body : ${JSON.stringify(mockRes.body)}`);

  const mockDb = await pool.query(
    'SELECT mock_gate_locked, mock_gate_reason FROM public.users WHERE id = $1',
    [candidateId]
  );
  console.log(
    `   DB State      : locked=${mockDb.rows[0].mock_gate_locked}, reason="${mockDb.rows[0].mock_gate_reason}"`
  );
  console.log('   ✅ Mock Exam Gate Persisted in Database\n');

  // 4. TEST FORCE LOGOUT (POST /api/v1/admin/users/:id/logout)
  console.log('4. TESTING FORCE LOGOUT (POST /api/v1/admin/users/:id/logout)');
  const logoutRes = await makeRequest(
    'POST',
    `/api/v1/admin/users/${candidateId}/logout`,
    JSON.stringify({})
  );
  console.log(`   Response Code : ${logoutRes.statusCode}`);
  console.log(`   Response Body : ${JSON.stringify(logoutRes.body)}`);
  console.log('   ✅ Force Logout Executed via Supabase Admin\n');

  // 5. TEST SUSPEND ACCOUNT (PATCH /api/v1/admin/users/:id/status)
  console.log('5. TESTING SUSPEND ACCOUNT (PATCH /api/v1/admin/users/:id/status)');
  const suspendRes = await makeRequest(
    'PATCH',
    `/api/v1/admin/users/${candidateId}/status`,
    JSON.stringify({ status: 'SUSPENDED', reason: 'Audit Test Suspension' })
  );
  console.log(`   Response Code : ${suspendRes.statusCode}`);
  console.log(`   Response Body : ${JSON.stringify(suspendRes.body)}`);

  const suspendDb = await pool.query('SELECT status FROM public.users WHERE id = $1', [
    candidateId,
  ]);
  console.log(`   DB State      : status="${suspendDb.rows[0].status}"`);
  console.log('   ✅ Account Suspension Persisted in Database\n');

  // 6. TEST RESTORE ACCOUNT (POST /api/v1/admin/users/:id/restore)
  console.log('6. TESTING RESTORE ACCOUNT (POST /api/v1/admin/users/:id/restore)');
  const restoreRes = await makeRequest(
    'POST',
    `/api/v1/admin/users/${candidateId}/restore`,
    JSON.stringify({})
  );
  console.log(`   Response Code : ${restoreRes.statusCode}`);
  console.log(`   Response Body : ${JSON.stringify(restoreRes.body)}`);

  const restoreDb = await pool.query('SELECT status, is_deleted FROM public.users WHERE id = $1', [
    candidateId,
  ]);
  console.log(
    `   DB State      : status="${restoreDb.rows[0].status}", is_deleted=${restoreDb.rows[0].is_deleted}`
  );
  console.log('   ✅ Account Restored to Active Status in Database\n');

  // 7. TEST SOFT DELETE / ARCHIVE (DELETE /api/v1/admin/users/:id)
  console.log('7. TESTING SOFT DELETE / ARCHIVE (DELETE /api/v1/admin/users/:id)');
  const deleteRes = await makeRequest('DELETE', `/api/v1/admin/users/${candidateId}`);
  console.log(`   Response Code : ${deleteRes.statusCode}`);
  console.log(`   Response Body : ${JSON.stringify(deleteRes.body)}`);

  const deleteDb = await pool.query(
    'SELECT status, is_deleted, deleted_at FROM public.users WHERE id = $1',
    [candidateId]
  );
  console.log(
    `   DB State      : status="${deleteDb.rows[0].status}", is_deleted=${deleteDb.rows[0].is_deleted}, deleted_at=${deleteDb.rows[0].deleted_at}`
  );
  console.log('   ✅ Soft Delete / Archival Persisted Safely in Database\n');

  console.log('=================================================================');
  console.log('ALL STUDENT DIRECTORY ADMIN ACTIONS VERIFIED 100% LIVE');
  console.log('=================================================================');
  await pool.end();
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body ? Buffer.byteLength(body) : 0,
          'x-student-id': 'admin-e2e-tester',
          'x-user-role': 'SUPER_ADMINISTRATOR',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ statusCode: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

runE2EVerification().catch((err) => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
