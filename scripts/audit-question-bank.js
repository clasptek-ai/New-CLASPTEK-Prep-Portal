const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify'),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('====================================================');
  console.log('QUESTION BANK DATABASE TRUTH & INVENTORY AUDIT');
  console.log('====================================================\n');

  // Total questions in public.questions
  const qCount = await pool.query(`SELECT count(*) FROM public.questions WHERE deleted_at IS NULL`);
  console.log('Total public.questions (not deleted):', qCount.rows[0].count);

  // Total question_versions
  const qvCount = await pool.query(`SELECT count(*) FROM public.question_versions`);
  console.log('Total public.question_versions:', qvCount.rows[0].count);

  // Total answer_options
  const optCount = await pool.query(`SELECT count(*) FROM public.answer_options`);
  console.log('Total public.answer_options:', optCount.rows[0].count);

  // Total reading_passages
  const pasCount = await pool.query(`SELECT count(*) FROM public.reading_passages`);
  console.log('Total public.reading_passages:', pasCount.rows[0].count);

  // Import batches
  const batches = await pool.query(
    `SELECT * FROM public.question_import_batches ORDER BY created_at DESC`
  );
  console.log('\nImport Batches:', batches.rows);

  // Breakdown by section and proficiency_level from question_versions
  const sectionBreakdown = await pool.query(`
    SELECT 
      payload->>'tags' as tags,
      proficiency_level,
      grammar_topic,
      count(*) 
    FROM public.question_versions 
    GROUP BY payload->>'tags', proficiency_level, grammar_topic
  `);
  console.log('\nSection & Level Breakdown in question_versions:');
  console.log(sectionBreakdown.rows);

  // Check unique question codes
  const codeStats = await pool.query(`
    SELECT 
      count(DISTINCT code) as unique_codes,
      count(*) as total_rows
    FROM public.questions
  `);
  console.log('\nQuestion Codes Stats:', codeStats.rows[0]);

  // Check duplicate codes if any
  const dupCodes = await pool.query(`
    SELECT code, count(*) 
    FROM public.questions 
    GROUP BY code 
    HAVING count(*) > 1
  `);
  console.log('Duplicate Question Codes:', dupCodes.rows);

  // Check orphan versions or questions without versions
  const orphans = await pool.query(`
    SELECT count(*) 
    FROM public.question_versions qv
    LEFT JOIN public.questions q ON q.id = qv.question_id
    WHERE q.id IS NULL
  `);
  console.log('Orphan question_versions:', orphans.rows[0].count);

  const qWithoutv = await pool.query(`
    SELECT count(*) 
    FROM public.questions q
    LEFT JOIN public.question_versions qv ON qv.question_id = q.id
    WHERE qv.id IS NULL
  `);
  console.log('Questions without versions:', qWithoutv.rows[0].count);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
