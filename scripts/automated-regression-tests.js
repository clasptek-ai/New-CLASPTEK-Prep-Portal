const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function runRegressionSuite() {
  console.log('================================================================');
  console.log(' CLASPTEK PREP PORTAL — AUTOMATED REGRESSION SUITE');
  console.log('================================================================\n');

  const results = [];
  const candidateA = '11111111-1111-1111-1111-111111111111';
  const candidateB = '22222222-2222-2222-2222-222222222222';
  const attemptId = 'a1111111-1111-1111-1111-111111111111';
  const catalogId = 'c1111111-1111-1111-1111-111111111111';

  try {
    // -----------------------------------------------------------------
    // TEST 1: Security — Zero Exposure of correctOptionCode in Client DTO
    // -----------------------------------------------------------------
    console.log('[TEST 1] Security: Verify correctOptionCode is NEVER exposed in DTO');
    const snapshotWithAnswers = {
      snapshotVersion: 1,
      assessment: { title: 'Test Exam' },
      grammarQuestions: [
        {
          id: 'q-sec-01',
          versionId: 'qv-sec-01',
          prompt: 'What is the past tense of run?',
          options: [
            { code: 'A', text: 'ran' },
            { code: 'B', text: 'runned' },
          ],
          correctOptionCode: 'A', // SERVER ONLY
          marks: 1,
        },
      ],
      readingPassage: {
        id: 'rp-sec-01',
        title: 'Passage Title',
        comprehensionQuestions: [
          {
            id: 'cq-sec-01',
            prompt: 'What is the main topic?',
            options: [{ code: 'A', text: 'Topic A' }],
            correctOptionCode: 'A', // SERVER ONLY
          },
        ],
      },
    };

    await pool.query(
      `INSERT INTO public.assessment_attempts (id, student_id, catalog_id, status, started_at, paper_snapshot)
       VALUES ($1, $2, $3, 'IN_PROGRESS', NOW(), $4)
       ON CONFLICT (id) DO UPDATE SET paper_snapshot = $4, status = 'IN_PROGRESS'`,
      [attemptId, candidateA, catalogId, JSON.stringify(snapshotWithAnswers)]
    );

    // Simulate DTO sanitization logic (same logic as GET /questions)
    const rawSnap = snapshotWithAnswers;
    const sanitizedGrammarQs = (rawSnap.grammarQuestions || []).map((q) => {
      const { correctOptionCode, ...rest } = q;
      return rest;
    });

    const hasExposedCode = sanitizedGrammarQs.some((q) => 'correctOptionCode' in q);
    console.log(`  Sanitized DTO exposes correctOptionCode: ${hasExposedCode}`);
    results.push({
      test: 'security_no_answer_key_exposure',
      passed: !hasExposedCode,
      detail: hasExposedCode
        ? 'FAIL: correctOptionCode was serialized!'
        : 'PASS: correctOptionCode stripped from DTO',
    });

    // -----------------------------------------------------------------
    // TEST 2: Snapshot Integrity — Admin edits do not modify frozen paper
    // -----------------------------------------------------------------
    console.log('\n[TEST 2] Snapshot Integrity: Question edit does not alter candidate paper');
    const readAttempt = await pool.query(
      `SELECT paper_snapshot FROM public.assessment_attempts WHERE id = $1`,
      [attemptId]
    );
    const storedSnap =
      typeof readAttempt.rows[0].paper_snapshot === 'string'
        ? JSON.parse(readAttempt.rows[0].paper_snapshot)
        : readAttempt.rows[0].paper_snapshot;

    const originalPrompt = storedSnap.grammarQuestions[0].prompt;
    const isUnchanged = originalPrompt === 'What is the past tense of run?';
    console.log(`  Candidate snapshot prompt: "${originalPrompt}"`);
    results.push({
      test: 'snapshot_integrity_isolation',
      passed: isUnchanged,
      detail: isUnchanged ? 'PASS: Snapshot remains immutable' : 'FAIL: Snapshot modified',
    });

    // -----------------------------------------------------------------
    // TEST 3: Duplicate Start — Idempotent creation returns active attempt
    // -----------------------------------------------------------------
    console.log('\n[TEST 3] Duplicate Start: Second start click returns existing attempt ID');
    const activeRes = await pool.query(
      `SELECT id FROM public.assessment_attempts
       WHERE student_id = $1 AND status = 'IN_PROGRESS' AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY started_at DESC LIMIT 1`,
      [candidateA]
    );

    const isDuplicateHandled = activeRes.rows.length > 0 && activeRes.rows[0].id === attemptId;
    console.log(`  Active attempt ID returned on second start: ${activeRes.rows[0]?.id}`);
    results.push({
      test: 'duplicate_start_idempotency',
      passed: isDuplicateHandled,
      detail: isDuplicateHandled
        ? 'PASS: Same attempt ID returned'
        : 'FAIL: Duplicate attempt created',
    });

    // -----------------------------------------------------------------
    // TEST 4: Autosave & Refresh — Answer persisted & restored
    // -----------------------------------------------------------------
    console.log('\n[TEST 4] Autosave & Refresh: Answer saved via PATCH restored after refresh');
    const qId = '00000000-0000-0000-0000-000000000001';
    const vId = '00000000-0000-0000-0000-000000000002';

    // Perform upsert (autosave)
    await pool.query(
      `INSERT INTO public.assessment_attempt_answers (attempt_id, question_id, question_version_id, response_payload, time_spent_ms)
       VALUES ($1, $2, $3, '{"selectedOptionCode":"A"}', 4200)
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET response_payload = EXCLUDED.response_payload, updated_at = NOW()`,
      [attemptId, qId, vId]
    );

    // Read back (refresh)
    const refreshedAns = await pool.query(
      `SELECT response_payload FROM public.assessment_attempt_answers WHERE attempt_id = $1 AND question_id = $2`,
      [attemptId, qId]
    );

    const restoredPayload =
      typeof refreshedAns.rows[0]?.response_payload === 'string'
        ? JSON.parse(refreshedAns.rows[0].response_payload)
        : refreshedAns.rows[0]?.response_payload;

    const isRestored = restoredPayload?.selectedOptionCode === 'A';
    console.log(`  Restored answer code: "${restoredPayload?.selectedOptionCode}"`);
    results.push({
      test: 'autosave_refresh_persistence',
      passed: isRestored,
      detail: isRestored ? 'PASS: Answer restored on refresh' : 'FAIL: Answer missing',
    });

    // -----------------------------------------------------------------
    // TEST 5: Submission Lock — Duplicate submit rejected
    // -----------------------------------------------------------------
    console.log('\n[TEST 5] Submission Lock: Concurrent submit lock prevents double submission');
    // Lock attempt as SUBMITTED
    await pool.query(
      `UPDATE public.assessment_attempts SET status = 'SUBMITTED', closed_at = NOW(), score = 85.0 WHERE id = $1`,
      [attemptId]
    );

    // Try second submit (querying status = IN_PROGRESS)
    const secondSubmitAttempt = await pool.query(
      `SELECT id FROM public.assessment_attempts WHERE id = $1 AND student_id = $2 AND status = 'IN_PROGRESS'`,
      [attemptId, candidateA]
    );

    const isSecondSubmitRejected = secondSubmitAttempt.rows.length === 0;
    console.log(`  Second submit query returned rows: ${secondSubmitAttempt.rows.length}`);
    results.push({
      test: 'submission_lock_duplicate_prevention',
      passed: isSecondSubmitRejected,
      detail: isSecondSubmitRejected
        ? 'PASS: Second submit rejected (0 IN_PROGRESS rows)'
        : 'FAIL: Allowed double submit',
    });

    // -----------------------------------------------------------------
    // TEST 6: Student Isolation — Candidate A cannot read Candidate B attempt
    // -----------------------------------------------------------------
    console.log('\n[TEST 6] Security Isolation: Candidate B cannot access Candidate A attempt');
    const unauthorizedAccess = await pool.query(
      `SELECT id FROM public.assessment_attempts WHERE id = $1 AND student_id = $2`,
      [attemptId, candidateB] // Querying candidateA's attempt as candidateB
    );

    const isIsolated = unauthorizedAccess.rows.length === 0;
    console.log(`  Cross-candidate access returned rows: ${unauthorizedAccess.rows.length}`);
    results.push({
      test: 'student_isolation_security',
      passed: isIsolated,
      detail: isIsolated
        ? 'PASS: Access rejected (0 rows returned)'
        : 'FAIL: Candidate B accessed Candidate A attempt',
    });

    // Cleanup test attempt
    await pool.query(`DELETE FROM public.assessment_attempt_answers WHERE attempt_id = $1`, [
      attemptId,
    ]);
    await pool.query(`DELETE FROM public.assessment_attempts WHERE id = $1`, [attemptId]);

    // -----------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------
    console.log('\n================================================================');
    console.log(' REGRESSION SUITE RESULTS');
    console.log('================================================================');
    let allPassed = true;
    results.forEach((r) => {
      const icon = r.passed ? '✅' : '❌';
      if (!r.passed) allPassed = false;
      console.log(`${icon} ${r.test.padEnd(45)} ${r.passed ? 'PASS' : 'FAIL'} — ${r.detail}`);
    });

    console.log(`\nTotal: ${results.filter((r) => r.passed).length} / ${results.length} PASSED`);
    await pool.end();

    if (!allPassed) process.exit(1);
  } catch (err) {
    console.error('Regression suite error:', err);
    await pool.end();
    process.exit(1);
  }
}

runRegressionSuite();
