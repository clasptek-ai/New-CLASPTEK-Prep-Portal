const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== AUDITING STUDENT ID & ASSESSMENT ATTEMPTS DATA FLOW ===\n');

  // 1. Inspect profiles table
  const profilesRes = await pool.query(`
    SELECT id, user_id, email, name, target_programme FROM public.profiles LIMIT 10
  `).catch((err) => ({ rows: [], error: err.message }));

  console.log('--- PROFILES TABLE ---');
  console.log(profilesRes.rows);

  // 2. Inspect assessment_attempts table
  const attemptsRes = await pool.query(`
    SELECT id, student_id, catalog_id, status, score, created_at
    FROM public.assessment_attempts
    ORDER BY created_at DESC LIMIT 10
  `).catch((err) => ({ rows: [], error: err.message }));

  console.log('\n--- ASSESSMENT ATTEMPTS TABLE ---');
  console.log(attemptsRes.rows);

  // 3. Inspect assessment_results table
  const resultsRes = await pool.query(`
    SELECT id, attempt_id, student_id, overall_score, cefr_level, predicted_band
    FROM public.assessment_results
    ORDER BY generated_at DESC LIMIT 10
  `).catch((err) => ({ rows: [], error: err.message }));

  console.log('\n--- ASSESSMENT RESULTS TABLE ---');
  console.log(resultsRes.rows);

  await pool.end();
}

main().catch(console.error);
