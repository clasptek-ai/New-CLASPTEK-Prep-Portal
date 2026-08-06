require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

async function main() {
  console.log('--- ATTEMPT TABLE SYNCHRONIZATION INSPECTION ---');

  const triggers = await pool.query(`
    SELECT trigger_name, event_manipulation, event_object_table, action_statement
    FROM information_schema.triggers
    WHERE event_object_table IN ('diagnostic_attempts', 'assessment_attempts')
  `);
  console.log('Triggers on attempt tables:', triggers.rows);

  const sampleDiag = await pool.query(
    'SELECT id, student_id, catalog_id, status FROM diagnostic_attempts LIMIT 3'
  );
  console.log('Sample diagnostic_attempts:', sampleDiag.rows);

  const sampleAssess = await pool.query(
    'SELECT id, student_id, catalog_id, status FROM assessment_attempts LIMIT 3'
  );
  console.log('Sample assessment_attempts:', sampleAssess.rows);

  await pool.end();
}

main().catch((err) => console.error(err));
