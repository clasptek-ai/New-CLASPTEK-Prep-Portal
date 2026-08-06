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
  console.log('================================================================');
  console.log('       MASTER FORENSIC AUDIT - ALL 9 PHASES EVIDENCE           ');
  console.log('================================================================\n');

  // PHASE 3: DATABASE INTEGRITY AUDIT
  console.log('--- PHASE 3: DATABASE INTEGRITY AUDIT ---');

  // 1. Orphan options
  const orphanOptions = await pool.query(`
    SELECT ao.id, ao.question_version_id
    FROM answer_options ao
    LEFT JOIN question_versions qv ON qv.id = ao.question_version_id
    WHERE qv.id IS NULL
  `);
  console.log(
    `Orphan answer_options (pointing to non-existent question_versions): ${orphanOptions.rows.length}`
  );

  // 2. Orphan question versions
  const orphanVersions = await pool.query(`
    SELECT qv.id, qv.question_id
    FROM question_versions qv
    LEFT JOIN questions q ON q.id = qv.question_id
    WHERE q.id IS NULL
  `);
  console.log(
    `Orphan question_versions (pointing to non-existent questions): ${orphanVersions.rows.length}`
  );

  // 3. Duplicate options per version
  const duplicateOptions = await pool.query(`
    SELECT question_version_id, option_code, count(*)
    FROM answer_options
    GROUP BY question_version_id, option_code
    HAVING count(*) > 1
  `);
  console.log(`Duplicate option_code per version_id: ${duplicateOptions.rows.length}`);

  // 4. Questions with 0 options
  const questionsZeroOptions = await pool.query(`
    SELECT q.code, qv.id as version_id
    FROM questions q
    JOIN question_versions qv ON qv.question_id = q.id
    LEFT JOIN answer_options ao ON ao.question_version_id = qv.id
    WHERE q.deleted_at IS NULL AND ao.id IS NULL
  `);
  console.log(`Active questions with 0 options in DB: ${questionsZeroOptions.rows.length}`);

  // 5. Questions with multiple correct options marked
  const multiCorrect = await pool.query(`
    SELECT q.code, qv.id as version_id, count(*) as correct_cnt
    FROM questions q
    JOIN question_versions qv ON qv.question_id = q.id
    JOIN answer_options ao ON ao.question_version_id = qv.id
    WHERE q.deleted_at IS NULL AND ao.is_correct = true
    GROUP BY q.code, qv.id
    HAVING count(*) > 1
  `);
  console.log(`Questions with >1 correct options in DB: ${multiCorrect.rows.length}`);

  // 6. Questions with 0 correct options marked
  const zeroCorrect = await pool.query(`
    SELECT q.code, qv.id as version_id
    FROM questions q
    JOIN question_versions qv ON qv.question_id = q.id
    JOIN answer_options ao ON ao.question_version_id = qv.id
    WHERE q.deleted_at IS NULL
    GROUP BY q.code, qv.id
    HAVING count(CASE WHEN ao.is_correct THEN 1 END) = 0
  `);
  console.log(`Questions with options but 0 marked correct in DB: ${zeroCorrect.rows.length}`);

  // 7. Check attempts table relationships
  const diagAttemptsCount = await pool.query('SELECT count(*) FROM diagnostic_attempts');
  const assessAttemptsCount = await pool.query('SELECT count(*) FROM assessment_attempts');
  const assessResultsCount = await pool.query('SELECT count(*) FROM assessment_results');

  console.log(`diagnostic_attempts row count: ${diagAttemptsCount.rows[0].count}`);
  console.log(`assessment_attempts row count: ${assessAttemptsCount.rows[0].count}`);
  console.log(`assessment_results row count: ${assessResultsCount.rows[0].count}`);

  // Check how many diagnostic_attempts are missing in assessment_attempts
  const unlinkedDiagAttempts = await pool.query(`
    SELECT da.id, da.student_id, da.status
    FROM diagnostic_attempts da
    LEFT JOIN assessment_attempts aa ON aa.id = da.id
    WHERE aa.id IS NULL
  `);
  console.log(
    `diagnostic_attempts NOT present in assessment_attempts: ${unlinkedDiagAttempts.rows.length}`
  );

  // Check how many assessment_results belong to diagnostic_attempts vs assessment_attempts
  const resultsDiagMatch = await pool.query(`
    SELECT ar.id, ar.attempt_id, da.id as diag_id, aa.id as assess_id
    FROM assessment_results ar
    LEFT JOIN diagnostic_attempts da ON da.id = ar.attempt_id
    LEFT JOIN assessment_attempts aa ON aa.id = ar.attempt_id
  `);
  let matchedDiag = 0;
  let matchedAssess = 0;
  let matchedNeither = 0;
  resultsDiagMatch.rows.forEach((r) => {
    if (r.diag_id) matchedDiag++;
    if (r.assess_id) matchedAssess++;
    if (!r.diag_id && !r.assess_id) matchedNeither++;
  });
  console.log(`assessment_results matching diagnostic_attempts: ${matchedDiag}`);
  console.log(`assessment_results matching assessment_attempts: ${matchedAssess}`);
  console.log(`assessment_results matching NEITHER table: ${matchedNeither}`);

  // PHASE 7: SYSTEM-WIDE IMPACT ANALYSIS
  console.log('\n--- PHASE 7: SYSTEM-WIDE IMPACT ANALYSIS ---');

  const templateQuestions = await pool.query(`
    SELECT DISTINCT q.code, q.created_at, qv.payload->>'passageCode' as passage_code
    FROM answer_options o
    JOIN question_versions qv ON qv.id = o.question_version_id
    JOIN questions q ON q.id = qv.question_id
    WHERE o.option_text = 'primary objective / core model'
    ORDER BY q.code ASC
  `);
  console.log(
    `Total questions affected by template options seeder: ${templateQuestions.rows.length}`
  );
  console.log(
    `Affected question code list:`,
    templateQuestions.rows.map((r) => r.code)
  );

  await pool.end();
}

main().catch((err) => console.error(err));
