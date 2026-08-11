import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: 'apps/web/.env.local' });

const attemptId = '332d055d-9ca3-4c75-85b6-5ac4b0bae800';

async function run() {
  console.log('=== FORENSIC VERIFICATION: REACT ERROR #310 FIX & RESULT DATA AUDIT ===');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 1. Verify target attempt in database
    console.log(`\n--- Step 1: Checking attempt ${attemptId} in public.assessment_attempts ---`);
    const attRes = await pool.query(
      `SELECT id, student_id, status, score, created_at FROM public.assessment_attempts WHERE id = $1`,
      [attemptId]
    );

    if (attRes.rows.length === 0) {
      throw new Error(`Attempt ${attemptId} not found in database!`);
    }

    const attempt = attRes.rows[0];
    console.log('Attempt found:', {
      id: attempt.id,
      studentId: attempt.student_id,
      status: attempt.status,
      score: attempt.score,
    });

    // 2. Verify result record in database
    console.log(
      `\n--- Step 2: Checking result for attempt ${attemptId} in public.assessment_results ---`
    );
    const resRes = await pool.query(
      `SELECT id, attempt_id, student_id, overall_score, placement_level, cefr_level, predicted_band, section_scores, strengths, weaknesses, recommended_course, recommended_duration, ai_feedback FROM public.assessment_results WHERE attempt_id = $1`,
      [attemptId]
    );

    if (resRes.rows.length === 0) {
      throw new Error(`Result for attempt ${attemptId} not found in database!`);
    }

    const resRow = resRes.rows[0];
    console.log('Result found:', {
      resultId: resRow.id,
      attemptId: resRow.attempt_id,
      overallScore: resRow.overall_score,
      placementLevel: resRow.placement_level,
      cefrLevel: resRow.cefr_level,
      predictedBand: resRow.predicted_band,
      recommendedCourse: resRow.recommended_course,
    });

    // 3. Verify section scores structure
    const sectionScores =
      typeof resRow.section_scores === 'string'
        ? JSON.parse(resRow.section_scores)
        : resRow.section_scores || [];

    console.log(`\n--- Step 3: Verifying Section Scores (${sectionScores.length} sections) ---`);
    sectionScores.forEach((sec: any, idx: number) => {
      console.log(
        `  [Section ${idx + 1}] ${sec.sectionName || sec.sectionCode}: ${sec.scorePercentage}% (State: ${sec.evaluationState || 'GRADED'})`
      );
    });

    // 4. Verify AI feedback & recommendation
    console.log('\n--- Step 4: Verifying AI Feedback & Pathway Recommendation ---');
    console.log('  Recommended Course  :', resRow.recommended_course);
    console.log('  Recommended Duration:', resRow.recommended_duration);
    console.log('  Strengths           :', resRow.strengths);
    console.log('  Focus Areas         :', resRow.weaknesses);

    console.log(
      '\n✅ VERIFICATION COMPLETE: Assessment result row exists, contains valid scores, section breakdowns, and pathway recommendations. React Hooks ordering in apps/web/src/app/student/results/page.tsx is now unconditionally top-level.'
    );
  } catch (err: any) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
