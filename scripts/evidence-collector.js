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

async function main() {
  console.log('================================================================');
  console.log('       EVIDENCE-BASED ASSESSMENT INTEGRITY AUDIT              ');
  console.log('================================================================\n');

  // 1. CAPTURE DATABASE RECORDS FOR ALL QUESTIONS & OPTIONS
  console.log('--- 1. CAPTURING DATABASE RECORDS FOR QUESTIONS & OPTIONS ---');
  const dbQs = await pool.query(`
    SELECT q.id as question_id, q.code as question_code, qv.id as version_id, qv.prompt, qv.proficiency_level, qv.payload,
           o.id as option_id, o.option_code, o.option_text, o.is_correct, o.display_order
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.answer_options o ON o.question_version_id = qv.id
    WHERE q.deleted_at IS NULL
    ORDER BY q.code ASC, o.display_order ASC
  `);

  console.log(`Fetched ${dbQs.rows.length} joined question-option rows from DB.`);

  // Group by question
  const dbQuestionMap = new Map();
  dbQs.rows.forEach((r) => {
    if (!dbQuestionMap.has(r.question_id)) {
      dbQuestionMap.set(r.question_id, {
        questionId: r.question_id,
        versionId: r.version_id,
        code: r.question_code,
        prompt: r.prompt,
        proficiencyLevel: r.proficiency_level,
        payload: r.payload,
        options: [],
      });
    }
    if (r.option_id) {
      dbQuestionMap.get(r.question_id).options.push({
        optionId: r.option_id,
        code: r.option_code,
        text: r.option_text,
        isCorrect: r.is_correct,
        displayOrder: r.display_order,
      });
    }
  });

  console.log(`Unique questions in DB: ${dbQuestionMap.size}`);

  // Find sample questions with options and sample questions without options in DB
  let sampleQs = Array.from(dbQuestionMap.values()).slice(0, 15);

  console.log('\n--- 2. CAPTURING RAW API RESPONSES & FRONTEND DTO SANITIZATION ---');

  // Create an attempt via POST /api/v1/assessment-attempts
  let attemptId = null;
  let rawStartAttemptResponse = null;
  let rawQuestionsResponse = null;

  try {
    const startRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-student-id': '07a40276-b7ae-4ff5-b3b3-bf76bbb1ee75',
      },
      body: JSON.stringify({ assessmentId: 'a0000000-0000-0000-0000-000000000001' }),
    });
    rawStartAttemptResponse = {
      status: startRes.status,
      headers: Object.fromEntries(startRes.headers.entries()),
      body: await startRes.json(),
    };
    attemptId =
      rawStartAttemptResponse.body?.data?.attemptId || rawStartAttemptResponse.body?.attemptId;
    console.log(
      `POST /api/v1/assessment-attempts HTTP ${rawStartAttemptResponse.status}: attemptId = ${attemptId}`
    );
  } catch (err) {
    console.error('Failed to call POST /api/v1/assessment-attempts:', err.message);
  }

  if (attemptId) {
    try {
      const qRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts/${attemptId}/questions`, {
        method: 'GET',
        headers: {
          'x-student-id': '07a40276-b7ae-4ff5-b3b3-bf76bbb1ee75',
        },
      });
      rawQuestionsResponse = {
        status: qRes.status,
        headers: Object.fromEntries(qRes.headers.entries()),
        body: await qRes.json(),
      };
      console.log(
        `GET /api/v1/assessment-attempts/${attemptId}/questions HTTP ${rawQuestionsResponse.status}`
      );
    } catch (err) {
      console.error('Failed to call GET /api/v1/assessment-attempts/:id/questions:', err.message);
    }
  }

  // Also test POST /api/v1/student/diagnostic/start
  let diagAttemptId = null;
  let rawDiagStartResponse = null;
  try {
    const diagStartRes = await fetch(`${BASE_URL}/api/v1/student/diagnostic/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-student-id': '07a40276-b7ae-4ff5-b3b3-bf76bbb1ee75',
      },
      body: JSON.stringify({ catalogId: 'a0000000-0000-0000-0000-000000000001' }),
    });
    rawDiagStartResponse = {
      status: diagStartRes.status,
      body: await diagStartRes.json(),
    };
    diagAttemptId = rawDiagStartResponse.body?.attemptId;
    console.log(
      `POST /api/v1/student/diagnostic/start HTTP ${rawDiagStartResponse.status}: attemptId = ${diagAttemptId}`
    );
  } catch (err) {
    console.error('Failed to call POST /api/v1/student/diagnostic/start:', err.message);
  }

  // Test calling /questions with diagnostic attempt ID
  let rawDiagQuestionsResponse = null;
  if (diagAttemptId) {
    try {
      const qRes = await fetch(
        `${BASE_URL}/api/v1/assessment-attempts/${diagAttemptId}/questions`,
        {
          method: 'GET',
          headers: {
            'x-student-id': '07a40276-b7ae-4ff5-b3b3-bf76bbb1ee75',
          },
        }
      );
      rawDiagQuestionsResponse = {
        status: qRes.status,
        body: await qRes.json(),
      };
      console.log(
        `GET /api/v1/assessment-attempts/${diagAttemptId}/questions HTTP ${rawDiagQuestionsResponse.status}`
      );
    } catch (err) {
      console.error(
        'Failed to call GET /api/v1/assessment-attempts/:id/questions for diag attempt:',
        err.message
      );
    }
  }

  // 3. SUBMISSION & RESULTS TESTING
  console.log('\n--- 3. CAPTURING SUBMISSION & RESULTS API RESPONSES ---');
  let rawSubmitResponse = null;
  let rawResultResponse = null;

  if (attemptId) {
    try {
      const subRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-student-id': '07a40276-b7ae-4ff5-b3b3-bf76bbb1ee75',
        },
        body: JSON.stringify({ examType: 'English Proficiency' }),
      });
      rawSubmitResponse = {
        status: subRes.status,
        body: await subRes.json(),
      };
      console.log(
        `POST /api/v1/assessment-attempts/${attemptId}/submit HTTP ${rawSubmitResponse.status}`
      );
    } catch (err) {
      console.error('Failed to submit attempt:', err.message);
    }

    try {
      const resRes = await fetch(`${BASE_URL}/api/v1/assessment-attempts/${attemptId}/result`, {
        method: 'GET',
        headers: {
          'x-student-id': '07a40276-b7ae-4ff5-b3b3-bf76bbb1ee75',
        },
      });
      rawResultResponse = {
        status: resRes.status,
        body: await resRes.json(),
      };
      console.log(
        `GET /api/v1/assessment-attempts/${attemptId}/result HTTP ${rawResultResponse.status}`
      );
    } catch (err) {
      console.error('Failed to fetch result:', err.message);
    }
  }

  // Print Summary Data
  console.log('\n================================================================');
  console.log('               RAW EVIDENCE RECORDING SUMMARY                   ');
  console.log('================================================================\n');

  console.log('RAW START ATTEMPT RESPONSE (POST /api/v1/assessment-attempts):');
  console.log(JSON.stringify(rawStartAttemptResponse, null, 2).slice(0, 500) + '...\n');

  console.log('RAW GET QUESTIONS RESPONSE (GET /api/v1/assessment-attempts/:id/questions):');
  console.log(JSON.stringify(rawQuestionsResponse, null, 2).slice(0, 800) + '...\n');

  console.log('RAW DIAGNOSTIC START RESPONSE (POST /api/v1/student/diagnostic/start):');
  console.log(JSON.stringify(rawDiagStartResponse, null, 2) + '\n');

  console.log(
    'RAW DIAGNOSTIC GET QUESTIONS RESPONSE (GET /api/v1/assessment-attempts/:diagId/questions):'
  );
  console.log(JSON.stringify(rawDiagQuestionsResponse, null, 2) + '\n');

  console.log('RAW SUBMIT RESPONSE (POST /api/v1/assessment-attempts/:id/submit):');
  console.log(JSON.stringify(rawSubmitResponse, null, 2) + '\n');

  console.log('RAW RESULT RESPONSE (GET /api/v1/assessment-attempts/:id/result):');
  console.log(JSON.stringify(rawResultResponse, null, 2) + '\n');

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
