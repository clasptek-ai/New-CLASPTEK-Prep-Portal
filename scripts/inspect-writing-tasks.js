const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== INSPECTING WRITING TASKS IN POSTGRESQL ===\n');

  // Check writing_tasks table if it exists
  const writingTable = await pool
    .query(
      `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'writing_tasks'
  `
    )
    .catch(() => ({ rows: [] }));

  console.log('public.writing_tasks columns:', writingTable.rows);

  if (writingTable.rows.length > 0) {
    const writingRows = await pool.query(`SELECT * FROM public.writing_tasks`);
    console.log('public.writing_tasks rows:', writingRows.rows);
  }

  // Check questions table for Writing section or Essay/Letter type
  const writingQuestions = await pool
    .query(
      `
    SELECT q.id, q.code, qv.prompt, qv.payload
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    WHERE q.deleted_at IS NULL
      AND (qv.payload->>'section' = 'Writing' OR qv.payload->>'type' IN ('ESSAY', 'LETTER'))
  `
    )
    .catch(() => ({ rows: [] }));

  console.log('\nWriting Questions in public.questions:', writingQuestions.rows);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
