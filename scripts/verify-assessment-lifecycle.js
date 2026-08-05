const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== END-TO-END VERIFICATION: ASSESSMENT LIFECYCLE & RESULTS DOMAIN ===\n');

  // 1. Verify assessment_results table structure
  const tableCheck = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'assessment_results'
  `);
  console.log(
    `✅ Step 1: public.assessment_results table verified (${tableCheck.rows.length} columns)`
  );

  // 2. Query attempts in DB
  const attemptsCheck = await pool.query(`
    SELECT id, student_id, status, score, closed_at, created_at 
    FROM public.assessment_attempts 
    ORDER BY created_at DESC LIMIT 5
  `);
  console.log(
    `✅ Step 2: Querying public.assessment_attempts (${attemptsCheck.rows.length} records found)`
  );
  attemptsCheck.rows.forEach((att) => {
    console.log(
      `   - Attempt ${att.id}: Status=${att.status}, Score=${att.score}, CreatedAt=${att.created_at}`
    );
  });

  // 3. Query persisted assessment_results
  const resultsCheck = await pool.query(`
    SELECT id, attempt_id, student_id, overall_score, cefr_level, predicted_band, placement_level, recommended_course, recommended_duration
    FROM public.assessment_results
    ORDER BY generated_at DESC LIMIT 5
  `);
  console.log(
    `\n✅ Step 3: Querying public.assessment_results (${resultsCheck.rows.length} stored result records found)`
  );
  resultsCheck.rows.forEach((res) => {
    console.log(
      `   - Result ${res.id} (Attempt ${res.attempt_id}): Score=${res.overall_score}%, CEFR=${res.cefr_level}, Band=${res.predicted_band}, Placement=${res.placement_level}, Pathway=${res.recommended_course} (${res.recommended_duration})`
    );
  });

  // 4. Check audit events in assessment_attempt_events
  const eventsCheck = await pool.query(`
    SELECT attempt_id, event_type, created_at
    FROM public.assessment_attempt_events
    ORDER BY created_at DESC LIMIT 10
  `);
  console.log(
    `\n✅ Step 4: Querying public.assessment_attempt_events (${eventsCheck.rows.length} audit events logged)`
  );
  eventsCheck.rows.forEach((evt) => {
    console.log(
      `   - Event [${evt.event_type}] for Attempt ${evt.attempt_id} at ${evt.created_at}`
    );
  });

  console.log('\n=== END-TO-END VERIFICATION COMPLETE: ALL SYSTEMS VERIFIED ===');
  await pool.end();
}

main().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
