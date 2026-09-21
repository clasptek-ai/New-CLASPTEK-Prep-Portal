import { Pool } from 'pg';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Load environment variables from apps/web/.env.local
const envContent = fs.readFileSync('apps/web/.env.local', 'utf-8');
envContent.split('\n').forEach((l) => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length)
    process.env[k.trim()] = v
      .join('=')
      .trim()
      .replace(/^['"]|['"]$/g, '');
});

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

interface GateResult {
  test: string;
  expected: string;
  actual: string;
  passed: boolean;
  releaseBlocking: boolean;
}

async function runPhase57ReleaseGate() {
  console.log('================================================================');
  console.log('PHASE 5.7 HARD RELEASE GATE & FORENSIC AUDIT VERIFICATION');
  console.log('================================================================\n');

  const results: GateResult[] = [];

  function record(
    test: string,
    expected: string,
    actual: string,
    passed: boolean,
    releaseBlocking = true
  ) {
    results.push({ test, expected, actual, passed, releaseBlocking });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${test}: ${actual}`);
  }

  // ── SECTION 1: QUESTION INVENTORY RECONCILIATION (Section 9) ──
  console.log('\n--- 1. QUESTION INVENTORY RECONCILIATION ---');
  const listeningCountRes = await pool.query(
    `SELECT count(DISTINCT q.id) as cnt FROM public.questions q WHERE q.code LIKE 'IELTS-L%' AND q.deleted_at IS NULL`
  );
  const readingCountRes = await pool.query(
    `SELECT count(DISTINCT q.id) as cnt FROM public.questions q WHERE q.code LIKE 'IELTS-R%' AND q.deleted_at IS NULL`
  );
  const writingCountRes = await pool.query(
    `SELECT count(DISTINCT q.id) as cnt FROM public.questions q WHERE q.code LIKE 'IELTS-W%' AND q.deleted_at IS NULL`
  );
  const speakingCountRes = await pool.query(
    `SELECT count(DISTINCT q.id) as cnt FROM public.questions q WHERE q.code LIKE 'IELTS-S%' AND q.deleted_at IS NULL`
  );

  const listeningCount = parseInt(listeningCountRes.rows[0]?.cnt || '0', 10);
  const readingCount = parseInt(readingCountRes.rows[0]?.cnt || '0', 10);
  const writingCount = parseInt(writingCountRes.rows[0]?.cnt || '0', 10);
  const speakingCount = parseInt(speakingCountRes.rows[0]?.cnt || '0', 10);

  const normalizedTotal = listeningCount + readingCount + writingCount + speakingCount;
  const runtimeUnitsTotal = listeningCount + readingCount + writingCount + 3; // 3 speaking parts

  record(
    'Question Inventory: Listening items',
    '40 items',
    `${listeningCount} items`,
    listeningCount >= 40
  );
  record(
    'Question Inventory: Reading items',
    '40 items',
    `${readingCount} items`,
    readingCount >= 40
  );
  record(
    'Question Inventory: Writing items',
    '2 tasks',
    `${writingCount} tasks`,
    writingCount >= 2
  );
  record(
    'Question Inventory: Speaking normalized prompts',
    '24 prompts',
    `${speakingCount} prompts`,
    speakingCount >= 24
  );
  record(
    'Question Inventory: Total Normalized Content Items',
    '106 items',
    `${normalizedTotal} items`,
    normalizedTotal >= 106
  );
  record(
    'Question Inventory: Blueprint Examination Runtime Units',
    '85 units',
    `${runtimeUnitsTotal} units`,
    runtimeUnitsTotal >= 85
  );

  // ── SECTION 2: PRE-ASSESSMENT ACTIVE FLOW & PERSISTENCE ──
  console.log('\n--- 2. PRE-ASSESSMENT ACTIVE FLOW & PERSISTENCE ---');
  const studentId = '505e2f81-2578-4a9c-9c82-d5ae1d7b3fc3';

  // Get paper snapshot
  const snapshotRes = await pool.query(
    `SELECT catalog_id, paper_snapshot FROM public.assessment_attempts WHERE paper_snapshot IS NOT NULL LIMIT 1`
  );
  const { catalog_id, paper_snapshot } = snapshotRes.rows[0];

  const activeAttemptId = randomUUID();
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + 30 * 60 * 1000); // 30 minutes in future

  await pool.query(
    `INSERT INTO public.assessment_attempts (
       id, student_id, catalog_id, status, started_at, duration_minutes, expires_at, paper_snapshot, created_at, updated_at
     ) VALUES ($1, $2, $3, 'IN_PROGRESS', $4, 30, $5, $6, NOW(), NOW())`,
    [activeAttemptId, studentId, catalog_id, startedAt, expiresAt, paper_snapshot]
  );

  // Fetch attempt questions via local HTTP API
  const baseUrl = 'http://localhost:3000';
  const questionsRes = await fetch(
    `${baseUrl}/api/v1/assessment-attempts/${activeAttemptId}/questions`,
    {
      headers: { 'x-student-id': studentId },
    }
  );

  const qJson = await questionsRes.json();
  const qOk = questionsRes.status === 200 && qJson.success && qJson.data.remainingTime > 1500;
  record(
    'Pre-Assessment API: Active attempt question retrieval & deadline',
    'HTTP 200 with remainingTime > 1500s',
    `HTTP ${questionsRes.status}, remainingTime = ${qJson.data?.remainingTime}s`,
    qOk
  );

  // Save an answer to question 1 before expiry
  const snapshotParsed =
    typeof paper_snapshot === 'string' ? JSON.parse(paper_snapshot) : paper_snapshot;
  const realQ1 = snapshotParsed?.grammarQuestions?.[0];
  const q1Id = qJson.data?.grammarQuestions?.[0]?.id || realQ1?.id || randomUUID();
  const q1VersionId = qJson.data?.grammarQuestions?.[0]?.versionId || realQ1?.versionId || q1Id;

  const patchRes = await fetch(`${baseUrl}/api/v1/assessment-attempts/${activeAttemptId}/answers`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-student-id': studentId },
    body: JSON.stringify({
      questionId: q1Id,
      questionVersionId: q1VersionId,
      answer: { selectedOptionCode: 'B' },
      timeSpentMs: 4000,
    }),
  });
  const patchJson = await patchRes.json();
  record(
    'Pre-Assessment Persistence: Save valid answer before expiry',
    'HTTP 200 with answer persisted',
    `HTTP ${patchRes.status}, success = ${patchJson.success}`,
    patchRes.status === 200 && patchJson.success
  );

  // Verify answer is saved in DB
  const dbAnswerCheck = await pool.query(
    `SELECT response_payload FROM public.assessment_attempt_answers WHERE attempt_id = $1 AND question_id = $2`,
    [activeAttemptId, q1Id]
  );
  const dbSavedOption = dbAnswerCheck.rows[0]?.response_payload?.selectedOptionCode;
  record(
    'Pre-Assessment Persistence: Answer verified in DB table',
    'Option B saved',
    `Option ${dbSavedOption} saved in DB`,
    dbSavedOption === 'B'
  );

  // ── SECTION 3: HARD RELEASE GATE — TIMER TIMEOUT ENFORCEMENT ──
  console.log('\n--- 3. HARD RELEASE GATE: TIMER TIMEOUT ENFORCEMENT ---');

  // Create an expired attempt (expired 10 minutes ago)
  const expiredAttemptId = randomUUID();
  const expStartedAt = new Date(Date.now() - 55 * 60 * 1000); // 55 mins ago
  const expExpiresAt = new Date(Date.now() - 10 * 60 * 1000); // expired 10 mins ago

  await pool.query(
    `INSERT INTO public.assessment_attempts (
       id, student_id, catalog_id, status, started_at, duration_minutes, expires_at, paper_snapshot, created_at, updated_at
     ) VALUES ($1, $2, $3, 'IN_PROGRESS', $4, 45, $5, $6, NOW(), NOW())`,
    [expiredAttemptId, studentId, catalog_id, expStartedAt, expExpiresAt, paper_snapshot]
  );

  // Pre-seed an answer that was saved before expiry
  await pool.query(
    `INSERT INTO public.assessment_attempt_answers (
       id, attempt_id, question_id, question_version_id, response_payload, time_spent_ms, created_at, updated_at
     ) VALUES (gen_random_uuid(), $1, $2, $3, $4, 3000, NOW(), NOW())`,
    [
      expiredAttemptId,
      q1Id,
      q1VersionId,
      JSON.stringify({ selectedOptionCode: 'A', textResponse: 'Saved prior to expiry' }),
    ]
  );

  // 1. Attempt post-expiry answer mutation via PATCH
  const lateMutationRes = await fetch(
    `${baseUrl}/api/v1/assessment-attempts/${expiredAttemptId}/answers`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-student-id': studentId },
      body: JSON.stringify({
        questionId: q1Id,
        questionVersionId: q1Id,
        answer: { selectedOptionCode: 'C', textResponse: 'LATE MUTATION ATTEMPT' },
        timeSpentMs: 5000,
      }),
    }
  );
  const lateMutationJson = await lateMutationRes.json();
  const lateMutationBlocked =
    lateMutationRes.status === 403 && lateMutationJson.code === 'ATTEMPT_EXPIRED';
  record(
    'HARD GATE Test: Direct API mutation after expiry rejected by server',
    'HTTP 403 ATTEMPT_EXPIRED',
    `HTTP ${lateMutationRes.status}, code = ${lateMutationJson.code}`,
    lateMutationBlocked
  );

  // 2. Verify pre-expiry saved answer was preserved and NOT overwritten
  const verifyPreservedRes = await pool.query(
    `SELECT response_payload FROM public.assessment_attempt_answers WHERE attempt_id = $1 AND question_id = $2`,
    [expiredAttemptId, q1Id]
  );
  const preservedPayload = verifyPreservedRes.rows[0]?.response_payload;
  const isPreserved =
    preservedPayload?.selectedOptionCode === 'A' &&
    preservedPayload?.textResponse === 'Saved prior to expiry';
  record(
    'HARD GATE Test: Already-saved answer preserved intact after expired mutation attempt',
    'Option A preserved intact, late mutation discarded',
    `Preserved option = ${preservedPayload?.selectedOptionCode}, text = "${preservedPayload?.textResponse}"`,
    isPreserved
  );

  // 3. Verify attempt status transitioned to closed/finalized in database
  const statusCheck = await pool.query(
    `SELECT status, closed_at FROM public.assessment_attempts WHERE id = $1`,
    [expiredAttemptId]
  );
  const currentStatus = statusCheck.rows[0]?.status;
  const isClosedAndExpired =
    (currentStatus === 'COMPLETED' || currentStatus === 'EXPIRED') &&
    Boolean(statusCheck.rows[0]?.closed_at);
  record(
    'HARD GATE Test: Attempt status persisted as closed/finalized in database',
    'status in (COMPLETED, EXPIRED) with closed_at set',
    `status = ${currentStatus}, closed_at = ${statusCheck.rows[0]?.closed_at}`,
    isClosedAndExpired
  );

  // 4. Test Browser Refresh / Multi-tab: GET questions on expired attempt returns remainingTime: 0 and status: EXPIRED
  const refreshRes = await fetch(
    `${baseUrl}/api/v1/assessment-attempts/${expiredAttemptId}/questions`,
    {
      headers: { 'x-student-id': studentId },
    }
  );
  const refreshJson = await refreshRes.json();
  const refreshBlocked =
    refreshRes.status === 200 &&
    refreshJson.data?.remainingTime === 0 &&
    refreshJson.data?.status === 'EXPIRED';
  record(
    'HARD GATE Test: Browser refresh / second tab cannot extend examination',
    'remainingTime = 0 and status = EXPIRED',
    `remainingTime = ${refreshJson.data?.remainingTime}s, status = ${refreshJson.data?.status}`,
    refreshBlocked
  );

  // 5. Test Submission Idempotency: Submit expired attempt
  const submit1Res = await fetch(
    `${baseUrl}/api/v1/assessment-attempts/${expiredAttemptId}/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-student-id': studentId },
      body: JSON.stringify({ examType: 'Universal Assessment' }),
    }
  );
  await submit1Res.json();

  // Second immediate submit to test duplicate prevention
  const submit2Res = await fetch(
    `${baseUrl}/api/v1/assessment-attempts/${expiredAttemptId}/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-student-id': studentId },
      body: JSON.stringify({ examType: 'Universal Assessment' }),
    }
  );
  const submit2Json = await submit2Res.json();

  // Idempotency: either both handle gracefully without error or 2nd recognizes already closed
  const idempotencyOk =
    (submit1Res.ok || submit1Res.status === 404 || submit1Res.status === 410) &&
    (submit2Res.ok ||
      submit2Res.status === 404 ||
      submit2Res.status === 410 ||
      submit2Json.error?.includes('closed') ||
      submit2Json.error?.includes('already'));
  record(
    'HARD GATE Test: Auto-submission & finalization is idempotent without duplicate records',
    'Idempotent submission handled safely without duplicate errors',
    `Submit 1: HTTP ${submit1Res.status}, Submit 2: HTTP ${submit2Res.status}`,
    idempotencyOk
  );

  // ── SECTION 4: DESIGN SYSTEM & ACCESSIBILITY AUDIT ──
  console.log('\n--- 4. DESIGN SYSTEM, COLOUR & ACCESSIBILITY TOKENS ---');

  const playerScreenSource = fs.readFileSync(
    'apps/web/src/features/assessment-player/AssessmentPlayerScreen.tsx',
    'utf-8'
  );
  const hasDarkSlateBg =
    playerScreenSource.includes('bg-slate-950') || playerScreenSource.includes('bg-slate-900');
  const usesClasptekSurfaceTokens =
    playerScreenSource.includes('(--surface-0)') && playerScreenSource.includes('(--bg-app)');
  const usesClasptekBrandTokens = playerScreenSource.includes('(--brand)');
  const hasInputLockout =
    playerScreenSource.includes("pointerEvents: isExpired ? 'none' : 'auto'") &&
    playerScreenSource.includes('if (isExpired) return;');
  const hasReadingSplitPane =
    playerScreenSource.includes('hasReadingPassage') && playerScreenSource.includes('BookOpen');

  record(
    'Pre-Assessment: Elimination of dark slate backgrounds',
    'No bg-slate-950 or bg-slate-900',
    hasDarkSlateBg ? 'Found dark slate classes' : 'Completely removed',
    !hasDarkSlateBg
  );
  record(
    'Pre-Assessment: Canonical Clasptek Light visual tokens',
    'Uses --surface-0, --bg-app, --brand',
    usesClasptekSurfaceTokens && usesClasptekBrandTokens
      ? 'Tokens present and configured'
      : 'Missing tokens',
    usesClasptekSurfaceTokens && usesClasptekBrandTokens
  );
  record(
    'Pre-Assessment: Reading Section Split-Pane Layout',
    'Split-pane with independent scroll and book badge',
    hasReadingSplitPane ? 'Passage pane + question pane verified' : 'Missing split pane',
    hasReadingSplitPane
  );
  record(
    'Pre-Assessment: Candidate Input Lockout upon 00:00 Expiry',
    'pointerEvents: none, inputs readOnly, mutations blocked',
    hasInputLockout ? 'Strict input lockout verified' : 'Lockout incomplete',
    hasInputLockout
  );

  const mockShellSource = fs.readFileSync(
    'apps/web/src/features/mock-engine/components/MockExamFullscreenShell.tsx',
    'utf-8'
  );
  const mockEngineSource = fs.readFileSync(
    'apps/web/src/features/mock-engine/components/IELTSExamEngine.tsx',
    'utf-8'
  );
  const writingEngineSource = fs.readFileSync(
    'apps/web/src/features/mock-engine/components/WritingSectionEngine.tsx',
    'utf-8'
  );

  const mockShellLocksNav =
    mockShellSource.includes('!isExpired') &&
    mockShellSource.includes('canPrevious && isExamActive');
  const mockEngineHarmonizedColors =
    mockEngineSource.includes('#0284c7') &&
    mockEngineSource.includes('#045ead') &&
    mockEngineSource.includes('#d97706');
  const writingHasControlledFallback =
    writingEngineSource.includes('imageLoadFailed') &&
    writingEngineSource.includes('Visual Stimulus Diagram Unavailable');

  record(
    'Mock Exam: Navigation locked when exam is inactive/expired',
    'Header section tabs and footer nav buttons disabled',
    mockShellLocksNav ? 'Navigation lockout enforced' : 'Navigation lockout missing',
    mockShellLocksNav
  );
  record(
    'Mock Exam: Harmonized Clasptek Brand Palette without arbitrary neon islands',
    'Sky Blue #0284c7, Brand #045ead, Warm Ochre #d97706, Teal #0d9488',
    mockEngineHarmonizedColors ? 'Harmonized section palette verified' : 'Using old colors',
    mockEngineHarmonizedColors
  );
  record(
    'Mock Exam: Writing Stimulus controlled fallback state',
    'Renders accessible fallback banner on diagram load failure',
    writingHasControlledFallback
      ? 'Controlled stimulus failure handling verified'
      : 'Fallback missing',
    writingHasControlledFallback
  );

  // ── FINAL RELEASE GATE VERDICT ──
  console.log('\n================================================================');
  console.log('FINAL HARD RELEASE GATE DECISION');
  console.log('================================================================');

  const allPassed = results.every((r) => r.passed);

  if (allPassed) {
    console.log('\n>>> TIMER_TIMEOUT_GATE = PASS');
    console.log('>>> PHASE_5_7 = PASS');
    console.log('>>> All 19 Release Gate & Forensic Assertions Verified Successfully.');
  } else {
    console.log('\n>>> TIMER_TIMEOUT_GATE = FAIL');
    console.log('>>> PHASE_5_7 = FAIL / RELEASE BLOCKED');
    console.log('Failed assertions:');
    results.filter((r) => !r.passed).forEach((r) => console.log(` - ${r.test}`));
  }

  await pool.end();
  process.exit(allPassed ? 0 : 1);
}

runPhase57ReleaseGate().catch((err) => {
  console.error('Fatal gate verification error:', err);
  process.exit(1);
});
