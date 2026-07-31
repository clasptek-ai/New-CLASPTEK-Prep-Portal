const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== INSPECTING DIAGNOSTIC TABLES IN POSTGRESQL ===\n');

  const attemptsTable = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'diagnostic_attempts'
    ORDER BY ordinal_position
  `);
  console.log('public.diagnostic_attempts columns:');
  console.log(attemptsTable.rows);

  const responsesTable = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'diagnostic_responses'
    ORDER BY ordinal_position
  `);
  console.log('\npublic.diagnostic_responses columns:');
  console.log(responsesTable.rows);

  const sampleQuestions = await pool.query(`
    SELECT q.id, q.code, qv.prompt, qv.proficiency_level, qv.grammar_topic, qv.payload
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    WHERE q.deleted_at IS NULL
    LIMIT 5
  `);
  console.log('\nSample Questions:');
  console.log(sampleQuestions.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
