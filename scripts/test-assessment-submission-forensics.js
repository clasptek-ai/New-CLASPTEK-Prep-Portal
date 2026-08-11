const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function runSubmissionForensics() {
  console.log('================================================================');
  console.log('ASSESSMENT SUBMISSION FORENSIC DIAGNOSTIC & TRACE');
  console.log('================================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const rawDbUrl = process.env.DATABASE_URL || '';

  const dbUrl = rawDbUrl.includes('sslmode')
    ? rawDbUrl.replace('sslmode=verify-full', 'sslmode=no-verify')
    : rawDbUrl;

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  // 1. Create temporary test student
  const testEmail = `sub_forensic_${Date.now()}@clasptek.org`;
  const testPassword = 'Password123!';

  console.log(`1. Provisioning test student: ${testEmail}...`);
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (authErr || !authData?.user) {
    console.error('Failed to create auth user:', authErr);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`   User created in auth.users with ID: ${userId}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO public.users (id, status, version, created_at, updated_at)
       VALUES ($1, 'ACTIVE', 1, now(), now())
       ON CONFLICT (id) DO NOTHING`,
      [userId]
    );
    await client.query(
      `INSERT INTO public.profiles (id, user_id, first_name, last_name, target_programme, locale, time_zone, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'Sub', 'Test', 'IELTS Academic', 'en', 'UTC', 1, now(), now())
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    await client.query(
      `INSERT INTO public.identities (id, user_id, email, provider, is_verified, login_identifier, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'LOCAL', true, $2, 1, now(), now())
       ON CONFLICT (email) DO NOTHING`,
      [userId, testEmail]
    );
    await client.query(
      `INSERT INTO public.security_profiles (id, user_id, lock_status, failed_attempts, version, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, 'UNLOCKED', 0, 1, now(), now())
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    await client.query('COMMIT');
    console.log('   Public application user records created.');

    // 2. Fetch an existing assessment definition ID
    const defRes = await client.query(
      'SELECT id, exam_type FROM public.assessment_definitions LIMIT 1'
    );
    let assessmentId = defRes.rows[0]?.id;
    let examType = defRes.rows[0]?.exam_type || 'IELTS_ACADEMIC';

    if (!assessmentId) {
      console.log(
        '   No assessment definition found in public.assessment_definitions. Creating fallback...'
      );
      const newDefRes = await client.query(
        `INSERT INTO public.assessment_definitions (id, exam_type, name, title, version, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), 'IELTS_ACADEMIC', 'IELTS Academic Diagnostic', 'IELTS Diagnostic', 1, true, now(), now())
         RETURNING id`
      );
      assessmentId = newDefRes.rows[0].id;
    }
    console.log(`2. Using Assessment Definition ID: ${assessmentId}`);

    // 3. Create an assessment attempt directly in DB
    const attemptId = require('crypto').randomUUID();
    const paperSnapshot = {
      examType: 'IELTS_ACADEMIC',
      grammarQuestions: [
        {
          id: 'g1',
          text: 'Sample Q1',
          options: [{ code: 'A', text: 'Option A' }],
          correctOptionCode: 'A',
          marks: 1,
        },
      ],
      readingPassage: {
        title: 'Sample Passage',
        comprehensionQuestions: [
          {
            id: 'r1',
            text: 'Sample R1',
            options: [{ code: 'B', text: 'Option B' }],
            correctOptionCode: 'B',
            marks: 1,
          },
        ],
      },
      writingTasks: [],
    };

    console.log(`3. Creating assessment attempt: ${attemptId}...`);
    await client.query(
      `INSERT INTO public.assessment_attempts (
        id, student_id, catalog_id, status, started_at, paper_snapshot, created_at, updated_at
      ) VALUES ($1, $2, $3, 'IN_PROGRESS', NOW(), $4, NOW(), NOW())`,
      [attemptId, userId, assessmentId, JSON.stringify(paperSnapshot)]
    );
    console.log('   Assessment attempt created.');

    // 4. Save sample answers
    console.log('4. Saving sample answers in assessment_attempt_answers...');
    await client.query(
      `INSERT INTO public.assessment_attempt_answers (
        id, attempt_id, question_id, response_payload, created_at, updated_at
      ) VALUES 
        (gen_random_uuid(), $1, 'g1', '{"selectedOptionCode": "A"}', NOW(), NOW()),
        (gen_random_uuid(), $1, 'r1', '{"selectedOptionCode": "B"}', NOW(), NOW())`,
      [attemptId]
    );
    console.log('   Answers saved.');

    // 5. Simulate submission logic of POST /api/v1/assessment-attempts/:id/submit
    console.log('\n5. Executing Submission logic for attempt...');

    // Test the exact SQL query steps in route.ts:
    const submitStart = Date.now();
    await client.query('BEGIN');

    const attemptRes = await client.query(
      `SELECT * FROM public.assessment_attempts
       WHERE id = $1 AND student_id = $2
       FOR UPDATE`,
      [attemptId, userId]
    );

    console.log('   Step 5a: Attempt query FOR UPDATE status:', attemptRes.rows[0]?.status);

    const snapshot =
      typeof attemptRes.rows[0].paper_snapshot === 'string'
        ? JSON.parse(attemptRes.rows[0].paper_snapshot)
        : attemptRes.rows[0].paper_snapshot;

    const answersRes = await client.query(
      `SELECT question_id, response_payload, time_spent_ms
       FROM public.assessment_attempt_answers
       WHERE attempt_id = $1`,
      [attemptId]
    );
    console.log('   Step 5b: Answers count:', answersRes.rows.length);

    // Lock attempt as SUBMITTED and store score
    await client.query(
      `UPDATE public.assessment_attempts
       SET status = 'SUBMITTED',
           closed_at = NOW(),
           score = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [100, attemptId]
    );
    console.log('   Step 5c: Attempt status updated to SUBMITTED.');

    // Write to assessment_results
    console.log('   Step 5d: Writing to public.assessment_results...');
    const resWrite = await client.query(
      `INSERT INTO public.assessment_results (
        attempt_id, student_id, assessment_category,
        overall_score, placement_level, cefr_level, predicted_band,
        section_scores, strengths, weaknesses, recommended_course,
        recommended_duration, ai_feedback, generated_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      ON CONFLICT (attempt_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        placement_level = EXCLUDED.placement_level,
        cefr_level = EXCLUDED.cefr_level,
        predicted_band = EXCLUDED.predicted_band,
        updated_at = NOW()
      RETURNING id`,
      [
        attemptId,
        userId,
        'DIAGNOSTIC',
        100,
        'ADVANCED',
        'C1',
        'Band 8.0',
        JSON.stringify([{ sectionCode: 'Grammar', scorePercentage: 100 }]),
        JSON.stringify(['Grammar']),
        JSON.stringify(['Vocabulary']),
        'Advanced Masterclass',
        '5 Weeks',
        JSON.stringify({ summary: 'Excellent' }),
      ]
    );
    console.log('   Step 5d RESULT: Created assessment_result ID:', resWrite.rows[0]?.id);

    // Log events
    await client.query(
      `INSERT INTO public.assessment_attempt_events (attempt_id, event_type, event_payload, created_at)
       VALUES ($1, 'SUBMITTED', $2, NOW())`,
      [attemptId, JSON.stringify({ submittedAt: new Date().toISOString() })]
    );

    await client.query('COMMIT');
    console.log(`✅ Submission simulated successfully in ${Date.now() - submitStart}ms!`);

    // 6. Test GET /api/v1/assessment-attempts/:id/result query
    console.log('\n6. Testing Result Lookup Query...');
    const resultLookup = await client.query(
      `SELECT * FROM public.assessment_results WHERE attempt_id = $1`,
      [attemptId]
    );
    console.log('   Result Lookup count:', resultLookup.rows.length);
    console.table(
      resultLookup.rows.map((r) => ({
        id: r.id,
        attempt_id: r.attempt_id,
        student_id: r.student_id,
        overall_score: r.overall_score,
        placement_level: r.placement_level,
        cefr_level: r.cefr_level,
      }))
    );

    // Clean up test data
    await client.query('DELETE FROM public.assessment_attempt_events WHERE attempt_id = $1', [
      attemptId,
    ]);
    await client.query('DELETE FROM public.assessment_results WHERE attempt_id = $1', [attemptId]);
    await client.query('DELETE FROM public.assessment_attempt_answers WHERE attempt_id = $1', [
      attemptId,
    ]);
    await client.query('DELETE FROM public.assessment_attempts WHERE id = $1', [attemptId]);
    await client.query('DELETE FROM public.security_profiles WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM public.identities WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM public.profiles WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM public.users WHERE id = $1', [userId]);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.log('\nCleaned up forensic test data.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Forensic DB Simulation Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runSubmissionForensics().catch(console.error);
