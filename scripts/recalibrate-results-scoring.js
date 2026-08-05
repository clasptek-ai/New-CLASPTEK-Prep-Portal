const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Recalibrating stored assessment_results scores for 100% mathematical coherence...');
  await pool.query(`
    UPDATE public.assessment_results
    SET cefr_level = CASE
      WHEN overall_score >= 85 THEN 'C1'
      WHEN overall_score >= 70 THEN 'B2'
      WHEN overall_score >= 50 THEN 'B1'
      WHEN overall_score >= 20 THEN 'A2'
      ELSE 'A1'
    END,
    predicted_band = CASE
      WHEN overall_score >= 85 THEN 'Band 8.0'
      WHEN overall_score >= 75 THEN 'Band 7.5'
      WHEN overall_score >= 65 THEN 'Band 7.0'
      WHEN overall_score >= 55 THEN 'Band 6.5'
      WHEN overall_score >= 45 THEN 'Band 6.0'
      WHEN overall_score >= 35 THEN 'Band 5.5'
      WHEN overall_score >= 25 THEN 'Band 5.0'
      WHEN overall_score >= 15 THEN 'Band 4.5'
      ELSE 'Band 3.5'
    END;
  `);

  console.log('✅ Stored assessment_results recalibrated!');
  await pool.end();
}

main();
