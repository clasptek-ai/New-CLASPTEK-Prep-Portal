const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== TESTING REAL DIAGNOSTIC ITEMS SELECTION FROM POSTGRESQL ===');

  // Fetch 30 Grammar Questions from PostgreSQL
  const grammarRes = await pool.query(`
    SELECT 
      q.id as question_id,
      q.code,
      qv.id as version_id,
      qv.prompt,
      qv.proficiency_level,
      qv.grammar_topic,
      qv.payload
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    WHERE q.deleted_at IS NULL
      AND (qv.payload->>'tags' LIKE '%English Proficiency%' OR qv.payload->>'tags' LIKE '%GRAMMAR%')
    ORDER BY q.created_at DESC
    LIMIT 30
  `);

  console.log('Grammar Questions fetched:', grammarRes.rows.length);

  // Fetch answer options for these questions
  const qvIds = grammarRes.rows.map(r => r.version_id);
  const optRes = await pool.query(`
    SELECT question_version_id, option_code, option_text, is_correct
    FROM public.answer_options
    WHERE question_version_id = ANY($1::uuid[])
    ORDER BY display_order ASC
  `, [qvIds]);

  console.log('Answer Options fetched:', optRes.rows.length);

  // Fetch Reading Passage
  const passageRes = await pool.query(`
    SELECT id, code, title, content
    FROM public.reading_passages
    LIMIT 1
  `);
  console.log('Reading Passage fetched:', passageRes.rows[0]?.title);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
