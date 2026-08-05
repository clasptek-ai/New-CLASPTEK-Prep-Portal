const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');
const { CanonicalJsonImporterRepository } = require(
  path.join(
    __dirname,
    '../packages/persistence/dist/question-bank/canonical-json-importer.repository.js'
  )
);

const dbUrl = process.env.DATABASE_URL.replace('sslmode=verify-full', 'sslmode=no-verify');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== TEST 1: 600-QUESTION REAL DB IMPORT ===');
  const importer = new CanonicalJsonImporterRepository(pool);

  const questions = Array.from({ length: 600 }).map((_, i) => ({
    questionCode: `EP-GRAM-INT-${String(i + 1).padStart(3, '0')}`,
    examType: 'English Proficiency',
    section: 'GRAMMAR',
    proficiencyLevel: 'INTERMEDIATE',
    grammarTopic: 'Verb Tenses',
    questionType: 'MCQ',
    prompt: `Grammar Question Prompt ${i + 1}`,
    options: [
      { code: 'A', text: 'Option A' },
      { code: 'B', text: 'Option B' },
      { code: 'C', text: 'Option C' },
      { code: 'D', text: 'Option D' },
    ],
    correctAnswer: 'B',
    usages: ['DIAGNOSTIC', 'PRACTICE'],
  }));

  const payload = {
    schemaVersion: '1.0',
    examType: 'English Proficiency',
    assessmentUsages: ['DIAGNOSTIC', 'PRACTICE'],
    metadata: {
      title: 'Clasptek_English_Proficiency_Grammar_Questions_Converted.json',
    },
    questions,
  };

  console.log('Executing importJsonBatch for 600 questions...');
  const startTime = Date.now();
  const res = await importer.importJsonBatch(payload, '00000000-0000-0000-0000-000000000001');
  console.log(`Import Finished in ${Date.now() - startTime}ms! Result:`, res);

  const qCount = await pool.query('SELECT count(*) FROM public.questions');
  const qvCount = await pool.query('SELECT count(*) FROM public.question_versions');
  const optCount = await pool.query('SELECT count(*) FROM public.answer_options');
  const batchCount = await pool.query('SELECT count(*) FROM public.question_import_batches');

  const intLevelCount = await pool.query(
    "SELECT count(*) FROM public.question_versions WHERE proficiency_level = 'INTERMEDIATE'"
  );
  const fndLevelCount = await pool.query(
    "SELECT count(*) FROM public.question_versions WHERE proficiency_level = 'FOUNDATION'"
  );
  const advLevelCount = await pool.query(
    "SELECT count(*) FROM public.question_versions WHERE proficiency_level = 'ADVANCED'"
  );

  console.log('\n=========================================');
  console.log('POSTGRESQL VERIFIED COUNTS AFTER IMPORT 1:');
  console.log('Questions in DB:', qCount.rows[0].count);
  console.log('Question Versions in DB:', qvCount.rows[0].count);
  console.log('Answer Options in DB:', optCount.rows[0].count);
  console.log('Import Batches in DB:', batchCount.rows[0].count);
  console.log('Foundation Level in DB:', fndLevelCount.rows[0].count);
  console.log('Intermediate Level in DB:', intLevelCount.rows[0].count);
  console.log('Advanced Level in DB:', advLevelCount.rows[0].count);
  console.log('=========================================');

  console.log('\n=== TEST 2: IDEMPOTENCY SECOND IMPORT ===');
  const res2 = await importer.importJsonBatch(payload, '00000000-0000-0000-0000-000000000001');
  console.log('Second Import Result:', res2);

  const qCount2 = await pool.query('SELECT count(*) FROM public.questions');
  console.log('Questions in DB after 2nd import (must remain 600):', qCount2.rows[0].count);

  await pool.end();
}

main().catch((err) => {
  console.error('Test script failed:', err);
  process.exit(1);
});
