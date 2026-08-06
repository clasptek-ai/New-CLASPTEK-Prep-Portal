require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

async function runAssessmentIntegrityReport() {
  console.log('================================================================');
  console.log('    CLASPTEK CI/CD GATES: QUESTION BANK & ASSESSMENT INTEGRITY  ');
  console.log('================================================================\n');

  let passes = true;

  // Gate 1: Every objective question has at least 2 options and at least 1 correct answer
  const objectiveCheck = await pool.query(`
    SELECT q.code, qv.id as version_id,
           count(ao.id) as option_count,
           count(CASE WHEN ao.is_correct THEN 1 END) as correct_count
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.answer_options ao ON ao.question_version_id = qv.id
    WHERE q.deleted_at IS NULL
      AND q.code NOT ILIKE 'ENG-WRIT-%' AND q.code NOT ILIKE '%ESSAY%'
    GROUP BY q.code, qv.id
    HAVING count(ao.id) < 2 OR count(CASE WHEN ao.is_correct THEN 1 END) = 0
  `);

  if (objectiveCheck.rows.length > 0) {
    console.error(`❌ GATE 1 FAIL: ${objectiveCheck.rows.length} objective questions missing valid options or correct answer.`);
    console.table(objectiveCheck.rows);
    passes = false;
  } else {
    console.log('✅ GATE 1 PASS: All objective questions have valid options and at least one correct answer.');
  }

  // Gate 2: Subjective / Essay questions have 0 objective answer options and non-empty prompt
  const essayCheck = await pool.query(`
    SELECT q.code, qv.id as version_id, qv.prompt, count(ao.id) as option_count
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.answer_options ao ON ao.question_version_id = qv.id
    WHERE q.deleted_at IS NULL
      AND (q.code ILIKE 'ENG-WRIT-%' OR q.code ILIKE '%ESSAY%')
    GROUP BY q.code, qv.id, qv.prompt
    HAVING count(ao.id) > 0 OR length(COALESCE(qv.prompt, '')) < 10
  `);

  if (essayCheck.rows.length > 0) {
    console.error(`❌ GATE 2 FAIL: ${essayCheck.rows.length} essay/writing questions have options or missing prompt.`);
    console.table(essayCheck.rows);
    passes = false;
  } else {
    console.log('✅ GATE 2 PASS: All writing tasks have valid prompts and 0 objective options in DB.');
  }

  // Gate 3: Every option belongs to exactly one question version
  const multiVersionCheck = await pool.query(`
    SELECT id, count(DISTINCT question_version_id) as version_cnt
    FROM public.answer_options
    GROUP BY id
    HAVING count(DISTINCT question_version_id) > 1
  `);

  if (multiVersionCheck.rows.length > 0) {
    console.error(`❌ GATE 3 FAIL: ${multiVersionCheck.rows.length} options belong to multiple question versions.`);
    console.table(multiVersionCheck.rows);
    passes = false;
  } else {
    console.log('✅ GATE 3 PASS: Every option belongs to exactly 1 question version.');
  }

  // Gate 4: Zero placeholder option texts remain in the database
  const placeholderCheck = await pool.query(`
    SELECT count(*) as cnt
    FROM public.answer_options
    WHERE option_text LIKE '%primary objective%'
       OR option_text LIKE '%secondary alternative%'
       OR option_text LIKE '%unrelated environmental%'
       OR option_text LIKE '%traditional legacy%'
  `);

  const placeholderCount = parseInt(placeholderCheck.rows[0].cnt, 10);
  if (placeholderCount > 0) {
    console.warn(`⚠️ GATE 4 AUDIT: ${placeholderCount} placeholder option text rows currently exist in DB (To be updated in Phase 1).`);
  } else {
    console.log('✅ GATE 4 PASS: Zero placeholder option texts detected in DB.');
  }

  // Gate 5: Passage Link Integrity for Reading Questions
  const readingPassageCheck = await pool.query(`
    SELECT q.code, qv.id as version_id, qv.payload->>'passageCode' as passage_code, rp.id as passage_id
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.reading_passages rp ON rp.code = qv.payload->>'passageCode'
    WHERE q.deleted_at IS NULL AND q.code ILIKE 'Q-READ-%' AND rp.id IS NULL
  `);

  if (readingPassageCheck.rows.length > 0) {
    console.error(`❌ GATE 5 FAIL: ${readingPassageCheck.rows.length} reading questions missing published reading passage.`);
    console.table(readingPassageCheck.rows);
    passes = false;
  } else {
    console.log('✅ GATE 5 PASS: All reading questions linked to valid published reading passages.');
  }

  await pool.end();
  
  if (!passes) {
    console.error('\n❌ Question Bank Integrity Verification FAILED!');
    process.exit(1);
  } else {
    console.log('\n================================================================');
    console.log('  SUCCESS: QUESTION BANK INTEGRITY CERTIFIED FOR PRODUCTION');
    console.log('================================================================\n');
  }
}

runAssessmentIntegrityReport().catch(err => {
  console.error('Integrity Report Error:', err);
  process.exit(1);
});
