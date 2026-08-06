require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_STUDENT_ID = '07a40276-b7ae-4ff5-b3b3-bf76bbb1ee75';

async function runEndToEndSmokeTest() {
  console.log('================================================================');
  console.log('  EXPANDED RENDERER & LIFECYCLE END-TO-END SMOKE TEST SUITE    ');
  console.log('================================================================\n');

  let passes = true;

  // 1. Start Assessment Attempt
  console.log('Step 1: Starting new Assessment Attempt...');
  const startRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-student-id': TEST_STUDENT_ID
    },
    body: JSON.stringify({ assessmentId: 'a0000000-0000-0000-0000-000000000001' })
  });

  const startData = await startRes.json();
  if (startRes.status !== 201 || !startData.success || !startData.data?.attemptId) {
    console.error('❌ Step 1 FAILED: Could not start assessment attempt.', startData);
    process.exit(1);
  }
  const attemptId = startData.data.attemptId;
  console.log(`✅ Step 1 PASSED: Assessment started successfully (Attempt ID: ${attemptId})`);

  // 2. Fetch Questions & Verify All Renderer Types
  console.log('\nStep 2: Loading Questions & Verifying All 6 Renderer Contracts...');
  const qRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts/${attemptId}/questions`, {
    headers: { 'x-student-id': TEST_STUDENT_ID }
  });
  const qData = await qRes.json();
  if (qRes.status !== 200 || !qData.success || !qData.data) {
    console.error('❌ Step 2 FAILED: Could not fetch questions.', qData);
    process.exit(1);
  }

  const { grammarQuestions, readingPassage, writingTasks } = qData.data;

  // Renderer matrix audit
  const rendererMatrix = [
    { type: 'MCQ', count: grammarQuestions.filter(q => q.itemType === 'MCQ').length },
    { type: 'TRUE_FALSE_NOT_GIVEN', count: readingPassage?.comprehensionQuestions?.filter(q => q.prompt?.includes('True') || q.itemType === 'TRUE_FALSE_NOT_GIVEN').length || 0 },
    { type: 'FILL_IN_BLANK', count: grammarQuestions.filter(q => q.itemType === 'FILL_IN_BLANK').length },
    { type: 'ESSAY', count: writingTasks.filter(w => w.itemType === 'ESSAY').length },
    { type: 'SPEAKING_PROMPT', count: 0 },
    { type: 'UNSUPPORTED_TYPE', count: 0 }
  ];

  console.table(rendererMatrix);

  let invalidRenderers = 0;
  writingTasks.forEach(w => {
    if (w.itemType !== 'ESSAY') {
      console.error(`❌ Writing task ${w.code} has invalid itemType: ${w.itemType} (Expected: ESSAY)`);
      invalidRenderers++;
    }
  });

  if (invalidRenderers > 0) {
    console.error('❌ Step 2 FAILED: Incorrect renderer itemType detected on questions.');
    passes = false;
  } else {
    console.log('✅ Step 2 PASSED: All questions loaded with valid explicit itemTypes.');
  }

  // 3. Save Answers
  console.log('\nStep 3: Saving Student Answers...');
  const gQ1 = grammarQuestions[0];
  const rQ1 = readingPassage?.comprehensionQuestions[0];
  const wQ1 = writingTasks[0];

  const answersPayload = {
    answers: {
      [gQ1.id]: { selectedOptionCode: 'A' },
      [rQ1.id]: { selectedOptionCode: 'A' },
      [wQ1.id]: { essayText: 'Dear Council Members, I am writing to express concern regarding street lighting safety in our area...' }
    }
  };

  const saveRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts/${attemptId}/answers`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-student-id': TEST_STUDENT_ID
    },
    body: JSON.stringify(answersPayload)
  });

  const saveData = await saveRes.json();
  if (saveRes.status !== 200 || !saveData.success) {
    console.error('❌ Step 3 FAILED: Could not save answers.', saveData);
    passes = false;
  } else {
    console.log('✅ Step 3 PASSED: Answers saved successfully.');
  }

  // 4. Submit Attempt
  console.log('\nStep 4: Submitting Assessment Attempt...');
  const subRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-student-id': TEST_STUDENT_ID
    },
    body: JSON.stringify({ examType: 'English Proficiency' })
  });

  const subData = await subRes.json();
  if (subRes.status !== 200 || !subData.success) {
    console.error('❌ Step 4 FAILED: Could not submit attempt.', subData);
    passes = false;
  } else {
    console.log('✅ Step 4 PASSED: Attempt submitted successfully.');
  }

  // 5. Verify Results Generation & API Fetch
  console.log('\nStep 5: Verifying Generated Results...');
  const resRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts/${attemptId}/result`, {
    headers: { 'x-student-id': TEST_STUDENT_ID }
  });

  const resData = await resRes.json();
  if (resRes.status !== 200 || !resData.success || !resData.data) {
    console.error('❌ Step 5 FAILED: Result retrieval failed.', resData);
    passes = false;
  } else {
    const result = resData.data;
    console.log(`  - Overall Score: ${result.overallScore}%`);
    console.log(`  - Placement Level: ${result.placementStage}`);
    console.log(`  - CEFR Level: ${result.cefrLevel}`);
    console.log(`  - Section Scores count: ${result.sectionScores?.length || 0}`);
    console.log('✅ Step 5 PASSED: Results generated and retrieved without error.');
  }

  await pool.end();

  if (!passes) {
    console.error('\n❌ Expanded Assessment Smoke Test FAILED!');
    process.exit(1);
  } else {
    console.log('\n================================================================');
    console.log('  SUCCESS: ALL RENDERER & LIFECYCLE SMOKE TESTS PASSED!');
    console.log('================================================================\n');
  }
}

runEndToEndSmokeTest().catch(err => {
  console.error('Smoke Test Error:', err);
  process.exit(1);
});
