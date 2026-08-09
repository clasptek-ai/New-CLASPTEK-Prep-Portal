const { Pool } = require('pg');
require('dotenv').config();

async function checkPassagesDb() {
  console.log('=================================================================');
  console.log('PASSAGES & QUESTION BANK PRODUCTION DATABASE AUDIT');
  console.log('=================================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl
      .replace(':6543/', ':5432/')
      .replace('sslmode=verify-full', 'sslmode=no-verify'),
    ssl: { rejectUnauthorized: false },
  });

  // 1. Reading Passages Audit
  const passagesRes = await pool.query(
    'SELECT id, code, title, exam_type, section, source, word_count, created_at FROM public.reading_passages ORDER BY created_at DESC'
  );
  console.log(`Reading Passages Count in public.reading_passages: ${passagesRes.rows.length}`);
  console.table(passagesRes.rows);

  // 2. Linked Questions Audit
  const questionsRes = await pool.query(
    `SELECT id, code, passage_id, section, difficulty, status, correct_answer
     FROM public.questions
     LIMIT 10`
  );
  console.log(`\nQuestions Sample in public.questions (${questionsRes.rows.length}):`);
  console.table(questionsRes.rows);

  // 3. Orphan Passages Audit
  const orphanPassages = await pool.query(
    `SELECT p.id, p.title FROM public.reading_passages p
     WHERE NOT EXISTS (SELECT 1 FROM public.questions q WHERE q.passage_id = p.id)`
  );
  console.log(`\nOrphan Passages (No linked questions): ${orphanPassages.rows.length}`);
  console.table(orphanPassages.rows);

  // 4. Orphan Questions Audit
  const orphanQuestions = await pool.query(
    `SELECT q.id, q.code, q.passage_id FROM public.questions q
     WHERE q.passage_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.reading_passages p WHERE p.id = q.passage_id)`
  );
  console.log(
    `\nOrphan Questions (passage_id points to non-existent passage): ${orphanQuestions.rows.length}`
  );
  console.table(orphanQuestions.rows);

  await pool.end();
}

checkPassagesDb().catch((err) => console.error(err));
