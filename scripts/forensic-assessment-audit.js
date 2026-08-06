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
  console.log('       FORENSIC AUDIT OF CLASPTEK ASSESSMENT ENGINE           ');
  console.log('================================================================\n');

  // --- ISSUE 1 & 4: QUESTION BANK & ANSWER OPTIONS INTEGRITY ---
  console.log('--- ISSUE 1 & 4: Question & Option Mapping Audit ---');

  const qRes = await pool.query(`
    SELECT q.id as question_id, q.code, q.created_at, qv.id as version_id, qv.prompt, qv.payload, qv.proficiency_level
    FROM public.questions q
    LEFT JOIN public.question_versions qv ON qv.question_id = q.id
    WHERE q.deleted_at IS NULL
    ORDER BY q.code ASC
  `);
  console.log(`Total active questions: ${qRes.rows.length}`);

  const optRes = await pool.query(`
    SELECT id, question_version_id, option_code, option_text, is_correct, display_order
    FROM public.answer_options
    ORDER BY question_version_id, display_order ASC
  `);
  console.log(`Total answer options in DB: ${optRes.rows.length}`);

  const versionIdsInQuestions = new Set(qRes.rows.map((r) => r.version_id).filter(Boolean));
  const optionsByVersion = new Map();
  const orphanedOptions = [];
  const duplicateOptions = [];
  const optionTextToVersions = new Map();

  optRes.rows.forEach((o) => {
    if (!versionIdsInQuestions.has(o.question_version_id)) {
      orphanedOptions.push(o);
    }

    if (!optionsByVersion.has(o.question_version_id)) {
      optionsByVersion.set(o.question_version_id, []);
    }
    const existing = optionsByVersion.get(o.question_version_id);
    if (existing.some((e) => e.option_code === o.option_code)) {
      duplicateOptions.push({
        version_id: o.question_version_id,
        code: o.option_code,
        option_id: o.id,
      });
    }
    existing.push(o);

    const key = `${o.option_code}:${o.option_text}`;
    if (!optionTextToVersions.has(key)) {
      optionTextToVersions.set(key, new Set());
    }
    optionTextToVersions.get(key).add(o.question_version_id);
  });

  console.log(`Orphaned options (pointing to missing version_id): ${orphanedOptions.length}`);
  console.log(`Duplicate option codes per version: ${duplicateOptions.length}`);

  let questionsWithoutOptions = 0;
  let questionsWithMultipleCorrect = 0;
  let questionsWithNoCorrect = 0;
  const questionsMismatches = [];

  qRes.rows.forEach((q) => {
    const opts = optionsByVersion.get(q.version_id) || [];
    if (opts.length === 0) {
      questionsWithoutOptions++;
      questionsMismatches.push({
        question_id: q.question_id,
        version_id: q.version_id,
        code: q.code,
        issue: 'NO_OPTIONS_IN_DB',
      });
    }
    const correctCount = opts.filter((o) => o.is_correct).length;
    if (opts.length > 0 && correctCount === 0) {
      questionsWithNoCorrect++;
      questionsMismatches.push({
        question_id: q.question_id,
        version_id: q.version_id,
        code: q.code,
        issue: 'NO_CORRECT_OPTION',
      });
    }
    if (correctCount > 1) {
      questionsWithMultipleCorrect++;
      questionsMismatches.push({
        question_id: q.question_id,
        version_id: q.version_id,
        code: q.code,
        issue: 'MULTIPLE_CORRECT_OPTIONS',
        count: correctCount,
      });
    }
  });

  console.log(`Questions with 0 options in DB: ${questionsWithoutOptions}`);
  console.log(`Questions with 0 correct options marked: ${questionsWithNoCorrect}`);
  console.log(`Questions with >1 correct options marked: ${questionsWithMultipleCorrect}`);
  if (questionsMismatches.length > 0) {
    console.log(
      'Sample question option mismatches (first 10):',
      JSON.stringify(questionsMismatches.slice(0, 10), null, 2)
    );
  }

  // Detect reused option arrays across different questions
  let reusedOptionSetCount = 0;
  for (const [key, versionSet] of optionTextToVersions.entries()) {
    if (versionSet.size > 1) {
      reusedOptionSetCount++;
    }
  }
  console.log(
    `Option code+text pairs reused across multiple question versions: ${reusedOptionSetCount}`
  );

  // --- ISSUE 2: WRITING & ITEM TYPES AUDIT ---
  console.log('\n--- ISSUE 2: Item Type & Renderer Audit ---');
  const writingTasksRes = await pool.query(
    `SELECT * FROM public.writing_tasks ORDER BY task_number ASC`
  );
  console.log(`Writing tasks in public.writing_tasks: ${writingTasksRes.rows.length}`);
  writingTasksRes.rows.forEach((w) => {
    console.log(
      `  Writing Task ${w.task_number} (${w.code}): title="${w.title}", minWords=${w.min_words}`
    );
  });

  const passagesRes = await pool.query(
    `SELECT id, code, title, status FROM public.reading_passages`
  );
  console.log(`Reading passages in public.reading_passages: ${passagesRes.rows.length}`);
  passagesRes.rows.forEach((p) => {
    console.log(`  Passage ${p.code} (${p.title}): status=${p.status}`);
  });

  // --- ISSUE 3: RESULTS & ATTEMPTS AUDIT ---
  console.log('\n--- ISSUE 3: Results & Submissions Audit ---');
  const attemptsRes = await pool.query(
    `SELECT id, student_id, status, score, paper_snapshot FROM public.assessment_attempts ORDER BY created_at DESC LIMIT 5`
  );
  console.log(`Recent assessment_attempts count: ${attemptsRes.rows.length}`);
  attemptsRes.rows.forEach((a) => {
    let snap =
      typeof a.paper_snapshot === 'string' ? JSON.parse(a.paper_snapshot) : a.paper_snapshot;
    console.log(`  Attempt ${a.id}: status=${a.status}, score=${a.score}`);
    console.log(`    Snapshot grammarQs: ${snap?.grammarQuestions?.length || 0}`);
    console.log(
      `    Snapshot readingPassage compQs: ${snap?.readingPassage?.comprehensionQuestions?.length || 0}`
    );
    console.log(`    Snapshot writingTasks: ${snap?.writingTasks?.length || 0}`);
  });

  const resultsRes = await pool.query(
    `SELECT * FROM public.assessment_results ORDER BY generated_at DESC LIMIT 5`
  );
  console.log(`Recent assessment_results count: ${resultsRes.rows.length}`);
  resultsRes.rows.forEach((r) => {
    console.log(
      `  Result ID: ${r.id} | Attempt: ${r.attempt_id} | OverallScore: ${r.overall_score} | CEFR: ${r.cefr_level}`
    );
    console.log(
      `    section_scores type: ${typeof r.section_scores}, isArray: ${Array.isArray(r.section_scores)}, raw: ${JSON.stringify(r.section_scores).slice(0, 80)}`
    );
    console.log(
      `    strengths type: ${typeof r.strengths}, isArray: ${Array.isArray(r.strengths)}, raw: ${JSON.stringify(r.strengths).slice(0, 80)}`
    );
    console.log(
      `    weaknesses type: ${typeof r.weaknesses}, isArray: ${Array.isArray(r.weaknesses)}, raw: ${JSON.stringify(r.weaknesses).slice(0, 80)}`
    );
  });

  await pool.end();
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
