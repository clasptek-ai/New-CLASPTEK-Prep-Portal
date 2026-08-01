const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Dropping NOT NULL constraint on assessment_results.session_id...');
  await pool.query(`
    ALTER TABLE public.assessment_results ALTER COLUMN session_id DROP NOT NULL;
  `);
  console.log('✅ session_id is now nullable!');
  await pool.end();
}

main();
