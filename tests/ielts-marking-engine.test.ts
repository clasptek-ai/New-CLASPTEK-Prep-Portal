// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PostgresCanonicalMockRepository } from '@clasptek/persistence';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const dbUrl = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

describe('IELTS Server-Authoritative Marking Engine Regressions', () => {
  let pool: pg.Pool;
  let mockRepo: PostgresCanonicalMockRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    mockRepo = new PostgresCanonicalMockRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  // Helper to fetch question_version_id and itemType by code
  async function getQuestionInfo(code: string) {
    const res = await pool.query(
      `SELECT qv.id as version_id, 
              COALESCE(qv.payload->>'itemType', qv.payload->>'type') as item_type,
              qv.payload->>'correctAnswer' as correct_answer,
              qv.payload->'acceptedAnswers' as accepted_answers
       FROM public.questions q
       JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
       WHERE q.code = $1 LIMIT 1`,
      [code]
    );
    if (res.rows.length === 0) throw new Error(`Question ${code} not found in DB`);
    return res.rows[0];
  }

  it('1. Correct MCQ: evaluates to true', async () => {
    const q = await getQuestionInfo('IELTS-L2-011'); // Correct is C
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'C', q.item_type);
    expect(result).toBe(true);
  });

  it('2. Incorrect MCQ: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-L2-011');
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'A', q.item_type);
    expect(result).toBe(false);
  });

  it('3. Correct completion: evaluates to true with case/whitespace tolerance', async () => {
    const q = await getQuestionInfo('IELTS-L1-001'); // Correct is Marshall
    const result1 = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'Marshall', q.item_type);
    expect(result1).toBe(true);
    const result2 = await mockRepo.evaluateObjectiveAnswer(
      q.version_id,
      '  marshall  ',
      q.item_type
    );
    expect(result2).toBe(true);
  });

  it('4. Incorrect completion: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-L1-001');
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'Smith', q.item_type);
    expect(result).toBe(false);
  });

  it('5. Accepted number with/without comma variant: evaluates to true', async () => {
    const q = await getQuestionInfo('IELTS-L1-007'); // '120000' or '120,000'
    const resNoComma = await mockRepo.evaluateObjectiveAnswer(q.version_id, '120000', q.item_type);
    expect(resNoComma).toBe(true);
    const resWithComma = await mockRepo.evaluateObjectiveAnswer(
      q.version_id,
      '120,000',
      q.item_type
    );
    expect(resWithComma).toBe(true);
    const resWrong = await mockRepo.evaluateObjectiveAnswer(q.version_id, '130000', q.item_type);
    expect(resWrong).toBe(false);
  });

  it('6. Accepted percent symbol tolerance: evaluates to true', async () => {
    const q = await getQuestionInfo('IELTS-L1-003'); // '3.85' or '3.85%'
    const resNoPct = await mockRepo.evaluateObjectiveAnswer(q.version_id, '3.85', q.item_type);
    expect(resNoPct).toBe(true);
    const resWithPct = await mockRepo.evaluateObjectiveAnswer(q.version_id, '3.85%', q.item_type);
    expect(resWithPct).toBe(true);
    const resWrong = await mockRepo.evaluateObjectiveAnswer(q.version_id, '4.85%', q.item_type);
    expect(resWrong).toBe(false);
  });

  it('7. Accepted hyphen variant tolerance: evaluates to true', async () => {
    const q19 = await getQuestionInfo('IELTS-L2-019'); // 'first aid' or 'first-aid'
    expect(await mockRepo.evaluateObjectiveAnswer(q19.version_id, 'first aid', q19.item_type)).toBe(
      true
    );
    expect(await mockRepo.evaluateObjectiveAnswer(q19.version_id, 'first-aid', q19.item_type)).toBe(
      true
    );

    const q37 = await getQuestionInfo('IELTS-L4-037'); // 'high fat' or 'high-fat'
    expect(await mockRepo.evaluateObjectiveAnswer(q37.version_id, 'high fat', q37.item_type)).toBe(
      true
    );
    expect(await mockRepo.evaluateObjectiveAnswer(q37.version_id, 'high-fat', q37.item_type)).toBe(
      true
    );
  });

  it('8. Question 33 multi-blank: 1 mark awarded only when both blanks are correct', async () => {
    const q33 = await getQuestionInfo('IELTS-L4-033'); // prompt: "weapons, e.g. ______ and ______" -> bows and arrows

    // Both correct JSON object
    const resJson1 = await mockRepo.evaluateObjectiveAnswer(
      q33.version_id,
      JSON.stringify({ blank1: 'bows', blank2: 'arrows' }),
      q33.item_type
    );
    expect(resJson1).toBe(true);

    // Positional matching: Blank 1 = bows, Blank 2 = arrows
    expect(
      await mockRepo.evaluateObjectiveAnswer(
        q33.version_id,
        JSON.stringify({ blank1: 'arrows', blank2: 'bows' }),
        q33.item_type
      )
    ).toBe(false);

    // Delimited string formats
    expect(
      await mockRepo.evaluateObjectiveAnswer(q33.version_id, 'bows, arrows', q33.item_type)
    ).toBe(true);
    expect(
      await mockRepo.evaluateObjectiveAnswer(q33.version_id, 'bows and arrows', q33.item_type)
    ).toBe(true);
    expect(
      await mockRepo.evaluateObjectiveAnswer(q33.version_id, 'arrows, bows', q33.item_type)
    ).toBe(false);

    // Single blank correct -> 0 marks (false)
    const resPartial = await mockRepo.evaluateObjectiveAnswer(
      q33.version_id,
      JSON.stringify({ blank1: 'bows', blank2: '' }),
      q33.item_type
    );
    expect(resPartial).toBe(false);

    // One blank wrong -> 0 marks (false)
    const resOneWrong = await mockRepo.evaluateObjectiveAnswer(
      q33.version_id,
      JSON.stringify({ blank1: 'bows', blank2: 'spears' }),
      q33.item_type
    );
    expect(resOneWrong).toBe(false);

    // Completely wrong -> 0 marks (false)
    const resAllWrong = await mockRepo.evaluateObjectiveAnswer(
      q33.version_id,
      JSON.stringify({ blank1: 'spears', blank2: 'shields' }),
      q33.item_type
    );
    expect(resAllWrong).toBe(false);
  });

  it('9. Correct TFNG: evaluates to true', async () => {
    const q = await getQuestionInfo('IELTS-READ-005'); // Correct is TRUE
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'TRUE', q.item_type);
    expect(result).toBe(true);
    const resLower = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'true', q.item_type);
    expect(resLower).toBe(true);
  });

  it('10. Incorrect TFNG: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-READ-005');
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'FALSE', q.item_type);
    expect(result).toBe(false);
  });

  it('11. Correct YNNG: evaluates to true and rejects wrong choices', async () => {
    const qNo = await getQuestionInfo('IELTS-READ-014'); // Correct is NO
    expect(await mockRepo.evaluateObjectiveAnswer(qNo.version_id, 'NO', qNo.item_type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(qNo.version_id, 'YES', qNo.item_type)).toBe(
      false
    );

    const qYes = await getQuestionInfo('IELTS-READ-015'); // Correct is YES
    expect(await mockRepo.evaluateObjectiveAnswer(qYes.version_id, 'YES', qYes.item_type)).toBe(
      true
    );
    expect(await mockRepo.evaluateObjectiveAnswer(qYes.version_id, 'NO', qYes.item_type)).toBe(
      false
    );
  });

  it('12. Correct matching (including Roman numerals): evaluates to true', async () => {
    const qHead = await getQuestionInfo('IELTS-READ-001'); // Correct is iii
    expect(await mockRepo.evaluateObjectiveAnswer(qHead.version_id, 'iii', qHead.item_type)).toBe(
      true
    );
    expect(await mockRepo.evaluateObjectiveAnswer(qHead.version_id, 'III', qHead.item_type)).toBe(
      true
    );
    expect(await mockRepo.evaluateObjectiveAnswer(qHead.version_id, 'iv', qHead.item_type)).toBe(
      false
    );
  });

  it('13. Unanswered question: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-L1-001');
    expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, '', q.item_type)).toBe(false);
    expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, '   ', q.item_type)).toBe(false);
  });

  it('14. Unknown / non-existent question ID: safely returns false without crashing', async () => {
    const result = await mockRepo.evaluateObjectiveAnswer(
      '00000000-0000-0000-0000-000000000000',
      'ANY_ANSWER',
      'UNKNOWN_TYPE'
    );
    expect(result).toBe(false);
  });

  it('15. Zero-Answer verification: 40 unanswered questions yield raw = 0 (no A/B fallback)', async () => {
    const lQuestions = await pool.query(
      `SELECT qv.id, COALESCE(qv.payload->>'itemType', qv.payload->>'type') as item_type
       FROM questions q
       JOIN question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
       WHERE q.code LIKE 'IELTS-L%'
       ORDER BY q.code ASC LIMIT 40`
    );

    let rawScore = 0;
    for (const row of lQuestions.rows) {
      const isCorrect = await mockRepo.evaluateObjectiveAnswer(row.id, '', row.item_type);
      if (isCorrect) rawScore++;
    }
    expect(rawScore).toBe(0);
  });

  it('16. Security Tampering: Server evaluates ground truth and ignores client claims', async () => {
    const q = await getQuestionInfo('IELTS-L2-011');
    const clientPayload = {
      questionId: q.version_id,
      studentAnswer: 'WRONG_CHOICE',
      score: 40,
      marks: 40,
      band: 9,
      isCorrect: true,
      rawScore: 40,
    };

    const serverJudgement = await mockRepo.evaluateObjectiveAnswer(
      clientPayload.questionId,
      clientPayload.studentAnswer,
      q.item_type
    );

    expect(serverJudgement).toBe(false);
    expect(clientPayload.score).toBe(40);
  });
});
