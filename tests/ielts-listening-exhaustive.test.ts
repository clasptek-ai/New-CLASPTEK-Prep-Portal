// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { PostgresCanonicalMockRepository } from '@clasptek/persistence';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const dbUrl = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

describe('IELTS Listening Canonical 40-Question Comprehensive Verification', () => {
  let pool: pg.Pool;
  let mockRepo: PostgresCanonicalMockRepository;
  let canonicalData: any;

  beforeAll(async () => {
    pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    mockRepo = new PostgresCanonicalMockRepository(pool);

    const jsonPath = path.join(
      process.cwd(),
      'datasets',
      'ielts',
      'ielts_listening_update_canonical.json'
    );
    canonicalData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  });

  afterAll(async () => {
    await pool.end();
  });

  it('1. Audio Registration: All 4 sections map exactly to audio/section-[1-4].mpeg and resolve correctly', async () => {
    const res = await pool.query(`
      SELECT ls.section_number, ls.title as section_title, lt.title as track_title, lt.url as track_url, lt.transcript
      FROM public.listening_sections ls
      JOIN public.listening_tracks lt ON lt.id = ls.track_id
      ORDER BY ls.section_number ASC
    `);

    expect(res.rows.length).toBe(4);

    const expectedAudio = [
      'audio/section-1.mpeg',
      'audio/section-2.mpeg',
      'audio/section-3.mpeg',
      'audio/section-4.mpeg',
    ];

    const expectedTitles = [
      'City Bank Customer Service Log',
      'September Celebration Day',
      'Grey-water Treatment System Project',
      'Origins of the Caveman Diet',
    ];

    res.rows.forEach((r, idx) => {
      expect(r.section_number).toBe(idx + 1);
      expect(r.track_url).toBe(expectedAudio[idx]);
      expect(r.section_title).toBe(expectedTitles[idx]);
      // Application resolves with leading slash:
      const resolvedUrl = r.track_url.startsWith('/') ? r.track_url : `/${r.track_url}`;
      expect(resolvedUrl).toBe(`/${expectedAudio[idx]}`);
    });
  });

  it('2. Zero Transcript Exposure: Audio tracks have null transcript and do not leak text to candidates', async () => {
    const res = await pool.query(`
      SELECT lt.id, lt.code, lt.title, lt.url, lt.transcript
      FROM public.listening_tracks lt
      WHERE lt.url LIKE '%audio/section-%'
    `);

    expect(res.rows.length).toBe(4);
    res.rows.forEach((r) => {
      expect(r.transcript).toBeNull();
    });
  });

  it('3. Question Rendering Inventory: Exactly 40 questions exist and are mapped to sections 1-4', async () => {
    const res = await pool.query(`
      SELECT q.code, qv.id as version_id, qv.prompt,
             COALESCE(qv.payload->>'type', qv.payload->>'itemType') as item_type,
             qv.payload->>'section' as section,
             qv.payload->'options' as options
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
      WHERE q.code LIKE 'IELTS-L%'
      ORDER BY q.code ASC
    `);

    expect(res.rows.length).toBe(40);

    // Section 1: Q1–10
    for (let i = 0; i < 10; i++) {
      expect(res.rows[i].code).toBe(`IELTS-L1-${String(i + 1).padStart(3, '0')}`);
      expect(res.rows[i].item_type).toBe('SHORT_ANSWER');
    }

    // Section 2: Q11–15 (MCQ) & Q16–20 (SHORT_ANSWER)
    for (let i = 10; i < 15; i++) {
      expect(res.rows[i].code).toBe(`IELTS-L2-${String(i + 1).padStart(3, '0')}`);
      expect(res.rows[i].item_type).toBe('MULTIPLE_CHOICE');
      expect(Array.isArray(res.rows[i].options)).toBe(true);
      expect(res.rows[i].options.length).toBe(3);
    }
    for (let i = 15; i < 20; i++) {
      expect(res.rows[i].code).toBe(`IELTS-L2-${String(i + 1).padStart(3, '0')}`);
      expect(res.rows[i].item_type).toBe('SHORT_ANSWER');
    }

    // Section 3: Q21–30 (SHORT_ANSWER)
    for (let i = 20; i < 30; i++) {
      expect(res.rows[i].code).toBe(`IELTS-L3-${String(i + 1).padStart(3, '0')}`);
      expect(res.rows[i].item_type).toBe('SHORT_ANSWER');
    }

    // Section 4: Q31–32 (SHORT_ANSWER), Q33 (MULTI_BLANK), Q34 (SHORT_ANSWER), Q35–36 (MCQ), Q37–40 (SHORT_ANSWER)
    expect(res.rows[30].item_type).toBe('SHORT_ANSWER');
    expect(res.rows[31].item_type).toBe('SHORT_ANSWER');
    expect(res.rows[32].code).toBe('IELTS-L4-033');
    expect(res.rows[32].item_type).toBe('MULTI_BLANK');
    expect(res.rows[33].item_type).toBe('SHORT_ANSWER');
    expect(res.rows[34].item_type).toBe('MULTIPLE_CHOICE');
    expect(res.rows[35].item_type).toBe('MULTIPLE_CHOICE');
    expect(res.rows[36].item_type).toBe('SHORT_ANSWER');
    expect(res.rows[37].item_type).toBe('SHORT_ANSWER');
    expect(res.rows[38].item_type).toBe('SHORT_ANSWER');
    expect(res.rows[39].item_type).toBe('SHORT_ANSWER');
  });

  it('4. Full 40-Question Marking Verification: Every question evaluates to true with its canonical answer', async () => {
    let perfectScore = 0;

    const allDbQ = await pool.query(`
      SELECT q.code, qv.id, COALESCE(qv.payload->>'type', qv.payload->>'itemType') as item_type
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
      WHERE q.code LIKE 'IELTS-L%'
    `);
    const qMap = new Map();
    allDbQ.rows.forEach((r) => qMap.set(r.code, r));

    for (const sec of canonicalData.sections) {
      for (const q of sec.questions) {
        const padded = String(q.number).padStart(3, '0');
        const code = `IELTS-L${sec.section}-${padded}`;

        const dbQ = qMap.get(code);
        expect(dbQ).toBeDefined();
        const { id, item_type } = dbQ;

        let answerToSubmit = '';
        if (q.type === 'multiple_choice') {
          answerToSubmit = q.correctAnswer;
        } else if (q.type === 'multi_blank') {
          answerToSubmit = JSON.stringify({ blank1: 'bows', blank2: 'arrows' });
        } else {
          answerToSubmit = q.acceptedAnswers[0];
        }

        const isCorrect = await mockRepo.evaluateObjectiveAnswer(id, answerToSubmit, item_type);
        expect(isCorrect).toBe(true);
        if (isCorrect) perfectScore++;
      }
    }

    expect(perfectScore).toBe(40);
  }, 30000);

  it('5. Question 33 multi-blank strictness: awards 1 mark if and only if both blanks are correct', async () => {
    const res = await pool.query(`
      SELECT qv.id, COALESCE(qv.payload->>'type', qv.payload->>'itemType') as item_type
      FROM public.questions q
      JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
      WHERE q.code = 'IELTS-L4-033'
    `);
    const { id, item_type } = res.rows[0];

    // Case 1: Both correct in JSON format (Blank 1 = bows, Blank 2 = arrows) -> 1 mark
    expect(
      await mockRepo.evaluateObjectiveAnswer(
        id,
        JSON.stringify({ blank1: 'bows', blank2: 'arrows' }),
        item_type
      )
    ).toBe(true);

    // Case 2: Reversed order in JSON format (Blank 1 = arrows, Blank 2 = bows) -> 0 marks (strict positional)
    expect(
      await mockRepo.evaluateObjectiveAnswer(
        id,
        JSON.stringify({ blank1: 'arrows', blank2: 'bows' }),
        item_type
      )
    ).toBe(false);

    // Case 3: Delimited string format -> positional matches true, reversed matches false
    expect(await mockRepo.evaluateObjectiveAnswer(id, 'bows, arrows', item_type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(id, 'bows and arrows', item_type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(id, 'arrows, bows', item_type)).toBe(false);

    // Case 4: Only blank 1 filled -> 0 marks
    expect(
      await mockRepo.evaluateObjectiveAnswer(
        id,
        JSON.stringify({ blank1: 'bows', blank2: '' }),
        item_type
      )
    ).toBe(false);

    // Case 5: Only blank 2 filled -> 0 marks
    expect(
      await mockRepo.evaluateObjectiveAnswer(
        id,
        JSON.stringify({ blank1: '', blank2: 'arrows' }),
        item_type
      )
    ).toBe(false);

    // Case 6: One correct, one incorrect -> 0 marks
    expect(
      await mockRepo.evaluateObjectiveAnswer(
        id,
        JSON.stringify({ blank1: 'bows', blank2: 'spears' }),
        item_type
      )
    ).toBe(false);

    // Case 7: Both incorrect -> 0 marks
    expect(
      await mockRepo.evaluateObjectiveAnswer(
        id,
        JSON.stringify({ blank1: 'stones', blank2: 'spears' }),
        item_type
      )
    ).toBe(false);
  });

  it('6. Normalization Rules Verification: All specified normalization rules function as expected', async () => {
    // 1. allowCommaInNumbers: Q7 Salary $70,001 – 120,000
    const q7 = (
      await pool.query(
        "SELECT qv.id, qv.payload->>'type' as type FROM questions q JOIN question_versions qv ON qv.question_id = q.id WHERE q.code = 'IELTS-L1-007'"
      )
    ).rows[0];
    expect(await mockRepo.evaluateObjectiveAnswer(q7.id, '120,000', q7.type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(q7.id, '120000', q7.type)).toBe(true);

    // 2. allowPercentSymbolWhenPromptAlreadyContainsPercent: Q3 2 years: 3.85 % per annum
    const q3 = (
      await pool.query(
        "SELECT qv.id, qv.payload->>'type' as type FROM questions q JOIN question_versions qv ON qv.question_id = q.id WHERE q.code = 'IELTS-L1-003'"
      )
    ).rows[0];
    expect(await mockRepo.evaluateObjectiveAnswer(q3.id, '3.85', q3.type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(q3.id, '3.85%', q3.type)).toBe(true);

    // 3. allowHyphenVariant: Q19 Ten first aid centres / first-aid
    const q19 = (
      await pool.query(
        "SELECT qv.id, qv.payload->>'type' as type FROM questions q JOIN question_versions qv ON qv.question_id = q.id WHERE q.code = 'IELTS-L2-019'"
      )
    ).rows[0];
    expect(await mockRepo.evaluateObjectiveAnswer(q19.id, 'first aid', q19.type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(q19.id, 'first-aid', q19.type)).toBe(true);

    // 4. allowHyphenVariant: Q37 high fat / high-fat
    const q37 = (
      await pool.query(
        "SELECT qv.id, qv.payload->>'type' as type FROM questions q JOIN question_versions qv ON qv.question_id = q.id WHERE q.code = 'IELTS-L4-037'"
      )
    ).rows[0];
    expect(await mockRepo.evaluateObjectiveAnswer(q37.id, 'high fat', q37.type)).toBe(true);
    expect(await mockRepo.evaluateObjectiveAnswer(q37.id, 'high-fat', q37.type)).toBe(true);

    // 5. trimWhitespace & collapseMultipleSpaces & caseInsensitive: Q4 Monthly Interest
    const q4 = (
      await pool.query(
        "SELECT qv.id, qv.payload->>'type' as type FROM questions q JOIN question_versions qv ON qv.question_id = q.id WHERE q.code = 'IELTS-L1-004'"
      )
    ).rows[0];
    expect(await mockRepo.evaluateObjectiveAnswer(q4.id, '  monthly   interest  ', q4.type)).toBe(
      true
    );
    expect(await mockRepo.evaluateObjectiveAnswer(q4.id, 'MONTHLY INTEREST', q4.type)).toBe(true);
  });
});
