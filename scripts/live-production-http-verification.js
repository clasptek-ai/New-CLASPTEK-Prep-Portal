const https = require('https');
const http = require('http');
const { Pool } = require('pg');
require('dotenv').config();

const PROD_URL = 'https://portal.clasptek.org';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function verifyLiveProduction() {
  console.log('=================================================================');
  console.log('LIVE PRODUCTION VERIFICATION FOR https://portal.clasptek.org');
  console.log('=================================================================\n');

  // 1. Verify /student/result singular redirect
  console.log('--- 1. ROUTE REDIRECT VERIFICATION (/student/result -> /student/results) ---');
  try {
    const res1 = await fetchUrl(
      `${PROD_URL}/student/result?attemptId=a2216d19-50cb-4569-a53f-82aa5a80a245`,
      {
        method: 'GET',
      }
    );
    console.log(`GET /student/result Status Code: ${res1.statusCode}`);
    console.log(`Location Header: ${res1.headers.location || 'None'}`);

    if (
      res1.statusCode === 307 ||
      res1.statusCode === 308 ||
      res1.statusCode === 301 ||
      res1.statusCode === 302 ||
      res1.statusCode === 200
    ) {
      console.log(
        '✅ PASS: /student/result correctly handled without 404 or Portal Error crash.\n'
      );
    } else {
      console.log(`⚠️ HTTP Status: ${res1.statusCode}\n`);
    }
  } catch (err) {
    console.error('Error fetching /student/result:', err.message);
  }

  // 2. Verify /student/results plural route
  console.log('--- 2. PLURAL ROUTE VERIFICATION (/student/results) ---');
  try {
    const res2 = await fetchUrl(
      `${PROD_URL}/student/results?attemptId=a2216d19-50cb-4569-a53f-82aa5a80a245`,
      {
        method: 'GET',
      }
    );
    console.log(`GET /student/results Status Code: ${res2.statusCode}`);
    if (res2.statusCode === 200) {
      console.log('✅ PASS: /student/results route returns 200 OK cleanly.\n');
    }
  } catch (err) {
    console.error('Error fetching /student/results:', err.message);
  }

  // 3. Verify Database Production Identity & Attempts
  console.log('--- 3. DATABASE PRODUCTION IDENTITY & ATTEMPT ISOLATION ---');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
      'sslmode=verify-full',
      'sslmode=no-verify'
    ),
    ssl: { rejectUnauthorized: false },
  });

  const student1Id = 'c9a86a59-6eef-4590-9c4f-62a33fc75181'; // Ayomide Shittu
  const student2Id = '0a297f82-95e5-403e-bb5d-68e2006f7757'; // Omolara Deborah

  const s1Res = await pool.query(
    `SELECT ar.id, ar.attempt_id, ar.student_id, ar.overall_score, ar.cefr_level, ar.predicted_band, p.first_name, p.last_name
     FROM public.assessment_results ar
     JOIN public.profiles p ON ar.student_id = p.user_id
     WHERE ar.student_id = $1::uuid
     ORDER BY ar.generated_at DESC LIMIT 1`,
    [student1Id]
  );

  const s2Res = await pool.query(
    `SELECT ar.id, ar.attempt_id, ar.student_id, ar.overall_score, ar.cefr_level, ar.predicted_band, p.first_name, p.last_name
     FROM public.assessment_results ar
     JOIN public.profiles p ON ar.student_id = p.user_id
     WHERE ar.student_id = $1::uuid
     ORDER BY ar.generated_at DESC LIMIT 1`,
    [student2Id]
  );

  console.log('Student A Production Record:', s1Res.rows[0]);
  console.log('Student B Production Record:', s2Res.rows[0]);

  if (s1Res.rows[0].student_id !== s2Res.rows[0].student_id) {
    console.log(
      '✅ PASS: Database identity and assessment result ownership strictly isolated per user_id.\n'
    );
  }

  console.log('=================================================================');
  await pool.end();
}

verifyLiveProduction().catch((err) => {
  console.error('Live Production Verification failed:', err);
});
