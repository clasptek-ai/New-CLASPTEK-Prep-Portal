const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Adding UNIQUE constraint on assessment_results(attempt_id)...');

  // Delete duplicates if any exist
  await pool.query(`
    DELETE FROM public.assessment_results a
    USING public.assessment_results b
    WHERE a.id < b.id AND a.attempt_id = b.attempt_id AND a.attempt_id IS NOT NULL;
  `);

  try {
    await pool.query(`
      ALTER TABLE public.assessment_results
      ADD CONSTRAINT assessment_results_attempt_id_key UNIQUE (attempt_id);
    `);
    console.log('✅ Unique constraint added successfully!');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️ Constraint already exists.');
    } else {
      console.error('Error adding constraint:', err.message);
    }
  }

  await pool.end();
}

main();
