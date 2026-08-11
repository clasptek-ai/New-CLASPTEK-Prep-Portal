const { Pool } = require('pg');
require('dotenv').config({ path: 'apps/web/.env.local' });

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const attemptId = '332d055d-9ca3-4c75-85b6-5ac4b0bae800';
    console.log(`Checking attemptId: ${attemptId}`);

    const attRes = await pool.query(
      'SELECT id, student_id, status, score, created_at FROM public.assessment_attempts WHERE id = $1',
      [attemptId]
    );
    console.log('Attempt row:', attRes.rows[0] || 'NOT FOUND');

    const resRes = await pool.query(
      'SELECT id, attempt_id, student_id, overall_score, placement_level, cefr_level, predicted_band, section_scores FROM public.assessment_results WHERE attempt_id = $1',
      [attemptId]
    );
    console.log('Result row:', resRes.rows[0] || 'NOT FOUND');
  } catch (err) {
    console.error('Database query error:', err);
  } finally {
    await pool.end();
  }
}

run();
