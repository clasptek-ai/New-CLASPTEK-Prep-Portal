const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function extractSelectedOptionCode(raw) {
  if (raw === null || raw === undefined) return null;

  let value = raw;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        value = JSON.parse(trimmed);
      } catch {
        value = trimmed;
      }
    } else {
      value = trimmed;
    }
  }

  if (typeof value === 'string') {
    return value.length > 0 ? value : null;
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value;
    const extracted =
      (typeof obj.selectedOptionCode === 'string' && obj.selectedOptionCode) ||
      (typeof obj.option === 'string' && obj.option) ||
      (typeof obj.code === 'string' && obj.code) ||
      (typeof obj.answer === 'string' && obj.answer) ||
      null;
    return extracted ? extracted.trim() : null;
  }

  return null;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(':6543/', ':5432/').replace(
    'sslmode=verify-full',
    'sslmode=no-verify'
  ),
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('=================================================================');
  console.log('PHASE 3: BACKUP SAFEGUARD & HISTORICAL ATTEMPTS RECALCULATION');
  console.log('=================================================================\n');

  const timestamp = Date.now();
  const backupDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFile = path.join(backupDir, `backup_attempts_${timestamp}.json`);

  // Step 1: Export Backup
  console.log('1. Exporting database safeguard backup...');
  const answersBackup = await pool.query('SELECT * FROM public.assessment_attempt_answers');
  const attemptsBackup = await pool.query('SELECT * FROM public.assessment_attempts');
  const resultsBackup = await pool.query('SELECT * FROM public.assessment_results');

  const backupData = {
    timestamp: new Date().toISOString(),
    answersCount: answersBackup.rows.length,
    attemptsCount: attemptsBackup.rows.length,
    resultsCount: resultsBackup.rows.length,
    assessment_attempt_answers: answersBackup.rows,
    assessment_attempts: attemptsBackup.rows,
    assessment_results: resultsBackup.rows,
  };

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`✅ Safeguard backup successfully written to ${backupFile}`);
  console.log(`   - Stored Answers: ${answersBackup.rows.length}`);
  console.log(`   - Stored Attempts: ${attemptsBackup.rows.length}`);
  console.log(`   - Stored Results: ${resultsBackup.rows.length}\n`);

  // Step 2: Fetch all submitted attempts
  console.log('2. Recalculating all submitted assessment attempts...');
  const attemptsRes = await pool.query(
    "SELECT * FROM public.assessment_attempts WHERE status = 'SUBMITTED'"
  );

  let processedAttempts = 0;
  let reevaluatedAnswers = 0;
  let scoreCorrections = 0;

  for (const attempt of attemptsRes.rows) {
    processedAttempts++;
    const paperSnapshot =
      typeof attempt.paper_snapshot === 'string'
        ? JSON.parse(attempt.paper_snapshot)
        : attempt.paper_snapshot || {};

    const answersRes = await pool.query(
      'SELECT id, question_id::text as question_id, response_payload FROM public.assessment_attempt_answers WHERE attempt_id = $1',
      [attempt.id]
    );

    const candidateAnswers = new Map();
    answersRes.rows.forEach((r) => {
      candidateAnswers.set(r.question_id, r.response_payload);
      // Strip 'comp-' prefix if present
      if (r.question_id.startsWith('comp-')) {
        candidateAnswers.set(r.question_id.replace('comp-', ''), r.response_payload);
      }
    });

    const grammarQs = paperSnapshot.grammarQuestions || [];
    let grammarCorrect = 0;
    let grammarTotal = 0;

    for (const q of grammarQs) {
      grammarTotal += q.marks || 1;
      const raw =
        candidateAnswers.get(String(q.id)) ||
        candidateAnswers.get(String(q.id).replace('comp-', ''));
      const selectedCode = extractSelectedOptionCode(raw);
      const isCorrect =
        selectedCode !== null && q.correctOptionCode && selectedCode === q.correctOptionCode;

      if (isCorrect) grammarCorrect += q.marks || 1;

      // Update assessment_attempt_answers.is_correct using text comparison or ID
      await pool.query(
        'UPDATE public.assessment_attempt_answers SET is_correct = $1, updated_at = NOW() WHERE attempt_id = $2 AND (question_id::text = $3 OR question_id::text = $4)',
        [isCorrect, attempt.id, String(q.id), `comp-${q.id}`]
      );
      reevaluatedAnswers++;
    }

    const readingPassage = paperSnapshot.readingPassage;
    const comprehensionQs = readingPassage?.comprehensionQuestions || [];
    let readingCorrect = 0;
    let readingTotal = 0;

    for (const q of comprehensionQs) {
      readingTotal += q.marks || 1;
      const raw =
        candidateAnswers.get(String(q.id)) ||
        candidateAnswers.get(String(q.id).replace('comp-', ''));
      const selectedCode = extractSelectedOptionCode(raw);
      const isCorrect =
        selectedCode !== null && q.correctOptionCode && selectedCode === q.correctOptionCode;

      if (isCorrect) readingCorrect += q.marks || 1;

      await pool.query(
        'UPDATE public.assessment_attempt_answers SET is_correct = $1, updated_at = NOW() WHERE attempt_id = $2 AND (question_id::text = $3 OR question_id::text = $4)',
        [isCorrect, attempt.id, String(q.id), `comp-${q.id}`]
      );
      reevaluatedAnswers++;
    }

    const grammarRaw = grammarTotal > 0 ? (grammarCorrect / grammarTotal) * 100 : 0;
    const readingRaw = readingTotal > 0 ? (readingCorrect / readingTotal) * 100 : 0;

    const scoringConfig = paperSnapshot.scoring || {
      grammarWeight: 0.6,
      readingWeight: 0.2,
      writingWeight: 0.2,
      placementThresholds: { ADVANCED: 80, INTERMEDIATE: 50, FOUNDATION: 0 },
    };

    const writingTasks = paperSnapshot.writingTasks || [];
    const writingPending = writingTasks.length > 0;
    const writingRaw = 0;

    let weightedScore;
    if (writingPending) {
      const totalObjectiveWeight = scoringConfig.grammarWeight + scoringConfig.readingWeight;
      const grammarAdjusted = scoringConfig.grammarWeight / totalObjectiveWeight;
      const readingAdjusted = scoringConfig.readingWeight / totalObjectiveWeight;
      weightedScore = grammarRaw * grammarAdjusted + readingRaw * readingAdjusted;
    } else {
      weightedScore =
        grammarRaw * scoringConfig.grammarWeight +
        readingRaw * scoringConfig.readingWeight +
        writingRaw * scoringConfig.writingWeight;
    }

    const newScore = Math.round(weightedScore * 100) / 100;
    const oldScore = attempt.score ? parseFloat(attempt.score) : 0;
    if (Math.abs(newScore - oldScore) > 0.01) {
      scoreCorrections++;
    }

    let computedLevel = 'FOUNDATION';
    const thresholds = scoringConfig.placementThresholds || {
      ADVANCED: 80,
      INTERMEDIATE: 50,
      FOUNDATION: 0,
    };
    if (newScore >= thresholds.ADVANCED) computedLevel = 'ADVANCED';
    else if (newScore >= thresholds.INTERMEDIATE) computedLevel = 'INTERMEDIATE';

    let cefrLevel = 'A1';
    let predictedBand = 'Band 3.5';

    if (newScore >= 85) {
      cefrLevel = 'C1';
      predictedBand = 'Band 8.0';
    } else if (newScore >= 75) {
      cefrLevel = 'C1';
      predictedBand = 'Band 7.5';
    } else if (newScore >= 65) {
      cefrLevel = 'B2';
      predictedBand = 'Band 7.0';
    } else if (newScore >= 55) {
      cefrLevel = 'B2';
      predictedBand = 'Band 6.5';
    } else if (newScore >= 45) {
      cefrLevel = 'B1';
      predictedBand = 'Band 6.0';
    } else if (newScore >= 35) {
      cefrLevel = 'B1';
      predictedBand = 'Band 5.5';
    } else if (newScore >= 25) {
      cefrLevel = 'A2';
      predictedBand = 'Band 5.0';
    } else if (newScore >= 15) {
      cefrLevel = 'A2';
      predictedBand = 'Band 4.5';
    } else {
      cefrLevel = 'A1';
      predictedBand = 'Band 3.5';
    }

    // Update public.assessment_attempts
    await pool.query(
      'UPDATE public.assessment_attempts SET score = $1, updated_at = NOW() WHERE id = $2',
      [newScore, attempt.id]
    );

    // Update or insert public.assessment_results
    await pool.query(
      `INSERT INTO public.assessment_results (
        attempt_id, student_id, assessment_category,
        overall_score, placement_level, cefr_level, predicted_band,
        generated_at, updated_at
      ) VALUES ($1, $2, 'DIAGNOSTIC', $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (attempt_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        placement_level = EXCLUDED.placement_level,
        cefr_level = EXCLUDED.cefr_level,
        predicted_band = EXCLUDED.predicted_band,
        updated_at = NOW()`,
      [attempt.id, attempt.student_id, newScore, computedLevel, cefrLevel, predictedBand]
    );
  }

  console.log('\n=================================================================');
  console.log('RECALCULATION SUMMARY');
  console.log('=================================================================');
  console.log(`- Total Submitted Attempts Processed : ${processedAttempts}`);
  console.log(`- Answers Re-evaluated & Scored       : ${reevaluatedAnswers}`);
  console.log(`- Attempt Scores Corrected            : ${scoreCorrections}`);
  console.log('✅ Historical attempts recalculation complete!\n');

  await pool.end();
}

run().catch((err) => {
  console.error('❌ Recalculation script error:', err);
  process.exit(1);
});
