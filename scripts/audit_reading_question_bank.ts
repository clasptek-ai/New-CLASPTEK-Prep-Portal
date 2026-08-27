import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres.texnwdyeyussmevexscw:Clasptek_2026@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=no-verify',
});

interface AuditReportItem {
  questionId: string;
  questionCode: string;
  questionType: string;
  prompt: string;
  optionsCount: number;
  acceptedAnswers: string[];
  correctAnswer: string | null;
  passageCode: string | null;
  passageTitle: string | null;
  classification:
    | 'PASS'
    | 'MISSING_OPTIONS'
    | 'MISSING_ACCEPTED_ANSWERS'
    | 'MISSING_PASSAGE'
    | 'INVALID_QUESTION_TYPE'
    | 'UNRENDERABLE';
  reasons: string[];
}

export async function auditReadingQuestionBank(fix: boolean = false): Promise<{
  totalQuestions: number;
  passCount: number;
  issueCount: number;
  report: AuditReportItem[];
}> {
  console.log(`\n======================================================`);
  console.log(` AUDIT READING QUESTION BANK (Mode: ${fix ? 'REPAIR' : 'REPORT'})`);
  console.log(`======================================================\n`);

  const qRes = await pool.query(`
    SELECT q.id, q.code, q.status as q_status,
           qv.id as version_id, qv.prompt, qv.payload, qv.status as qv_status,
           rp.code as passage_code, rp.title as passage_title
    FROM public.questions q
    JOIN public.question_versions qv ON qv.question_id = q.id
    LEFT JOIN public.reading_passages rp ON (
      rp.code = qv.payload->>'passageCode' OR 
      rp.id::text = qv.payload->>'passageCode' OR
      rp.code = qv.payload->>'passageId' OR 
      rp.id::text = qv.payload->>'passageId'
    )
    WHERE q.code LIKE 'Q-READ%' OR q.code LIKE 'IELTS-READ%'
    ORDER BY q.code ASC
  `);

  // Fetch answer options
  const optRes = await pool.query(`
    SELECT question_version_id, option_code, option_text, is_correct
    FROM public.answer_options
    ORDER BY question_version_id, display_order ASC
  `);

  const optionsByVer = new Map<string, any[]>();
  for (const o of optRes.rows) {
    if (!optionsByVer.has(o.question_version_id)) optionsByVer.set(o.question_version_id, []);
    optionsByVer.get(o.question_version_id)!.push(o);
  }

  const report: AuditReportItem[] = [];
  let passCount = 0;
  let issueCount = 0;

  for (const row of qRes.rows) {
    const payload = row.payload || {};
    const rawType = (
      payload.type ||
      payload.questionType ||
      payload.itemType ||
      row.base_question_type ||
      'MCQ'
    )
      .toString()
      .toUpperCase()
      .replace(/[\s-]/g, '_');

    const opts = optionsByVer.get(row.version_id) || payload.options || [];
    const isInputType = [
      'COMPLETION',
      'SENTENCE_COMPLETION',
      'SHORT_ANSWER',
      'SHORT_RESPONSE',
      'GAP_FILL',
      'FILL_IN_BLANK',
      'FILL_IN_THE_BLANK',
      'SUMMARY_COMPLETION',
      'TABLE_COMPLETION',
      'DIAGRAM_COMPLETION',
      'INPUT',
    ].includes(rawType);

    const isOptionType = [
      'MULTIPLE_CHOICE',
      'MCQ',
      'TRUE_FALSE_NOT_GIVEN',
      'TFNG',
      'YES_NO_NOT_GIVEN',
      'YNNG',
      'MATCHING',
      'MATCHING_HEADINGS',
      'MATCHING_INFORMATION',
      'MATCHING_FEATURES',
      'MATCHING_SENTENCE_ENDINGS',
    ].includes(rawType);

    let accepted =
      payload.acceptedAnswers || payload.acceptableAnswers || payload.validAnswers || [];
    if (payload.correctAnswer) accepted = [...accepted, payload.correctAnswer];
    const correctOpt = opts.find((o: any) => o.is_correct || o.isCorrect);
    if (correctOpt?.option_text || correctOpt?.text) {
      accepted = [...accepted, correctOpt.option_text || correctOpt.text];
    }
    // Explanation extraction
    if (payload.explanation) {
      const match = payload.explanation.match(/[“"']([^“”"']{1,50})[”"']/);
      if (match && match[1] && !match[1].includes('statement is')) {
        accepted = [...accepted, match[1].trim()];
      }
    }
    accepted = Array.from(new Set(accepted.map((s: any) => String(s).trim()).filter(Boolean)));

    const reasons: string[] = [];
    let classification: AuditReportItem['classification'] = 'PASS';

    if (!row.passage_code) {
      classification = 'MISSING_PASSAGE';
      reasons.push('No linked reading passage');
    }

    if (isInputType) {
      if (accepted.length === 0) {
        classification = 'MISSING_ACCEPTED_ANSWERS';
        reasons.push('No accepted answers defined for input question');
      }
    } else if (rawType === 'MULTIPLE_CHOICE' || rawType === 'MCQ') {
      if (opts.length < 2) {
        classification = 'MISSING_OPTIONS';
        reasons.push(`MCQ requires ≥2 options, found ${opts.length}`);
      }
      if (!correctOpt && !payload.correctOptionCode && !payload.correctAnswer) {
        classification = 'MISSING_OPTIONS';
        reasons.push('No correct option designated');
      }
    }

    if (classification === 'PASS') {
      passCount++;
    } else {
      issueCount++;
    }

    report.push({
      questionId: row.id,
      questionCode: row.code,
      questionType: rawType,
      prompt: row.prompt,
      optionsCount: opts.length,
      acceptedAnswers: accepted,
      correctAnswer:
        correctOpt?.option_code || payload.correctOptionCode || payload.correctAnswer || null,
      passageCode: row.passage_code,
      passageTitle: row.passage_title,
      classification,
      reasons,
    });

    // If fix mode is requested, backfill payload.acceptedAnswers and questionType in question_versions
    if (fix && isInputType && accepted.length > 0) {
      const updatedPayload = {
        ...payload,
        type: rawType,
        itemType: 'INPUT',
        acceptedAnswers: accepted,
      };
      await pool.query(`UPDATE public.question_versions SET payload = $1 WHERE id = $2`, [
        JSON.stringify(updatedPayload),
        row.version_id,
      ]);
    }
  }

  console.log(`Total Reading Questions: ${qRes.rows.length}`);
  console.log(`PASS: ${passCount} | ISSUES: ${issueCount}`);
  for (const item of report) {
    if (item.classification !== 'PASS') {
      console.log(
        `  [${item.classification}] Question ${item.questionCode} (${item.questionType}): ${item.reasons.join(', ')}`
      );
    }
  }

  return { totalQuestions: qRes.rows.length, passCount, issueCount, report };
}

if (require.main === module) {
  const shouldFix = process.argv.includes('--fix');
  auditReadingQuestionBank(shouldFix)
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      pool.end();
    });
}
