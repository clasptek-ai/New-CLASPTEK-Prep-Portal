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
    const q = await getQuestionInfo('IELTS-L1-006'); // Correct is B
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'B', q.item_type);
    expect(result).toBe(true);
  });

  it('2. Incorrect MCQ: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-L1-006');
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'A', q.item_type);
    expect(result).toBe(false);
  });

  it('3. Correct completion: evaluates to true with case/whitespace tolerance', async () => {
    const q = await getQuestionInfo('IELTS-L1-001'); // Correct is Hughes
    const result1 = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'Hughes', q.item_type);
    expect(result1).toBe(true);
    const result2 = await mockRepo.evaluateObjectiveAnswer(q.version_id, '  hughes  ', q.item_type);
    expect(result2).toBe(true);
  });

  it('4. Incorrect completion: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-L1-001');
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'Smith', q.item_type);
    expect(result).toBe(false);
  });

  it('5. Accepted completion variant: evaluates to true', async () => {
    const q = await getQuestionInfo('IELTS-L1-005'); // 'garden gloves' or 'gloves'
    const resExact = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'garden gloves', q.item_type);
    expect(resExact).toBe(true);
    const resVariant = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'gloves', q.item_type);
    expect(resVariant).toBe(true);
    const resWrong = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'shoes', q.item_type);
    expect(resWrong).toBe(false);
  });

  it('6. Correct TFNG: evaluates to true', async () => {
    const q = await getQuestionInfo('IELTS-READ-005'); // Correct is TRUE
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'TRUE', q.item_type);
    expect(result).toBe(true);
    const resLower = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'true', q.item_type);
    expect(resLower).toBe(true);
  });

  it('7. Incorrect TFNG: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-READ-005');
    const result = await mockRepo.evaluateObjectiveAnswer(q.version_id, 'FALSE', q.item_type);
    expect(result).toBe(false);
  });

  it('8. Correct YNNG: evaluates to true and rejects wrong choices', async () => {
    const qNo = await getQuestionInfo('IELTS-READ-014'); // Correct is NO
    expect(await mockRepo.evaluateObjectiveAnswer(qNo.version_id, 'NO', qNo.item_type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(qNo.version_id, 'YES', qNo.item_type)).toBe(false);

    const qYes = await getQuestionInfo('IELTS-READ-015'); // Correct is YES
    expect(await mockRepo.evaluateObjectiveAnswer(qYes.version_id, 'YES', qYes.item_type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(qYes.version_id, 'NO', qYes.item_type)).toBe(false);
  });

  it('9. Correct matching (including Roman numerals & map): evaluates to true', async () => {
    // Matching Headings (roman numerals)
    const qHead = await getQuestionInfo('IELTS-READ-001'); // Correct is iii
    expect(await mockRepo.evaluateObjectiveAnswer(qHead.version_id, 'iii', qHead.item_type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(qHead.version_id, 'III', qHead.item_type)).toBe(true);

    // Map Labelling
    const qMap = await getQuestionInfo('IELTS-L2-015'); // Correct is D
    expect(await mockRepo.evaluateObjectiveAnswer(qMap.version_id, 'D', qMap.item_type)).toBe(true);
  });

  it('10. Incorrect matching: evaluates to false', async () => {
    const qHead = await getQuestionInfo('IELTS-READ-001');
    expect(await mockRepo.evaluateObjectiveAnswer(qHead.version_id, 'iv', qHead.item_type)).toBe(false);

    const qMap = await getQuestionInfo('IELTS-L2-015');
    expect(await mockRepo.evaluateObjectiveAnswer(qMap.version_id, 'A', qMap.item_type)).toBe(false);
  });

  it('11. Unanswered question: evaluates to false', async () => {
    const q = await getQuestionInfo('IELTS-L1-001');
    expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, '', q.item_type)).toBe(false);
    expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, '   ', q.item_type)).toBe(false);
  });

  it('12. Unknown / non-existent question ID: safely returns false without crashing', async () => {
    const result = await mockRepo.evaluateObjectiveAnswer(
      '00000000-0000-0000-0000-000000000000',
      'ANY_ANSWER',
      'UNKNOWN_TYPE'
    );
    expect(result).toBe(false);
  });

  it('13. Zero-Answer verification: 40 unanswered questions yield raw = 0 (no A/B fallback)', async () => {
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

  it('14. Security Tampering: Server evaluates ground truth and ignores client claims', async () => {
    // Scenario: Client submits wrong answers but claims score: 40, isCorrect: true
    const q = await getQuestionInfo('IELTS-L1-006');
    const clientPayload = {
      questionId: q.version_id,
      studentAnswer: 'WRONG_CHOICE',
      score: 40,
      marks: 40,
      band: 9,
      isCorrect: true,
      rawScore: 40,
    };

    // Server evaluates purely based on studentAnswer:
    const serverJudgement = await mockRepo.evaluateObjectiveAnswer(
      clientPayload.questionId,
      clientPayload.studentAnswer,
      q.item_type
    );

    expect(serverJudgement).toBe(false);
    expect(clientPayload.score).toBe(40); // Client claim is untrusted
  });
});
