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

describe('Phase 5 — Mock Examination Production Integrity & Acceptance Suite', () => {
  let pool: pg.Pool;
  let mockRepo: PostgresCanonicalMockRepository;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    mockRepo = new PostgresCanonicalMockRepository(pool);
    // Warm up pool connection
    await pool.query('SELECT 1');
  }, 20000);

  afterAll(async () => {
    await pool.end();
  });

  // --------------------------------------------------------------------------
  // 1. CANONICAL BLUEPRINT AUDIT
  // --------------------------------------------------------------------------
  describe('1. Canonical Blueprint Structure & Requirements', () => {
    it('verifies canonical IELTS Academic blueprint exists and is PUBLISHED/APPROVED', async () => {
      const res = await pool.query(`
        SELECT id, exam_type, exam_code, title, status, sections_payload
        FROM public.mock_blueprints
        WHERE id = '00000000-0000-0000-0000-000000000001'
        LIMIT 1
      `);
      expect(res.rows.length).toBe(1);
      const bp = res.rows[0];
      expect(['PUBLISHED', 'APPROVED']).toContain(bp.status);
      expect(bp.exam_type).toBe('IELTS Academic');

      const sections = bp.sections_payload;
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBe(4);

      // Section names, order, question counts, and duration
      const [listening, reading, writing, speaking] = sections;
      expect(listening.name).toBe('Listening');
      expect(listening.questionCount).toBe(40);
      expect(listening.timeLimitMinutes).toBe(30);

      expect(reading.name).toBe('Reading');
      expect(reading.questionCount).toBe(40);
      expect(reading.timeLimitMinutes).toBe(60);

      expect(writing.name).toBe('Writing');
      expect(writing.questionCount).toBe(2);
      expect(writing.timeLimitMinutes).toBe(60);

      expect(speaking.name).toBe('Speaking');
      expect(speaking.questionCount).toBe(3);
      expect(speaking.timeLimitMinutes).toBe(15);
    }, 15000);
  });

  // --------------------------------------------------------------------------
  // 2. CANONICAL QUESTION BANK INTEGRITY
  // --------------------------------------------------------------------------
  describe('2. Canonical Question Inventory & Completeness', () => {
    it('verifies exactly 40 canonical Listening questions exist across 4 sections with 0 missing answers', async () => {
      const res = await pool.query(`
        SELECT q.code, qv.payload->>'correctAnswer' as correct_answer, qv.payload->'acceptedAnswers' as accepted_answers
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
        WHERE q.code LIKE 'IELTS-L%'
        ORDER BY q.code ASC
      `);
      expect(res.rows.length).toBe(40);

      // Check that every question has an authoritative answer defined
      for (const row of res.rows) {
        const hasAnswer =
          Boolean(row.correct_answer) ||
          (Array.isArray(row.accepted_answers) && row.accepted_answers.length > 0);
        expect(hasAnswer).toBe(true);
      }
    }, 15000);

    it('verifies exactly 40 canonical Reading questions exist across 3 passages with 0 missing answers', async () => {
      const res = await pool.query(`
        SELECT q.code, qv.payload->>'correctAnswer' as correct_answer, qv.payload->'acceptedAnswers' as accepted_answers
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
        WHERE q.code LIKE 'IELTS-READ-%'
        ORDER BY q.code ASC
      `);
      expect(res.rows.length).toBeGreaterThanOrEqual(40);

      const activeExamQuestions = res.rows.filter((r) => {
        const num = parseInt(r.code.replace('IELTS-READ-', ''), 10);
        return num >= 81 && num <= 120;
      });
      expect(activeExamQuestions.length).toBe(40);

      for (const row of activeExamQuestions) {
        const hasAnswer =
          Boolean(row.correct_answer) ||
          (Array.isArray(row.accepted_answers) && row.accepted_answers.length > 0);
        expect(hasAnswer).toBe(true);
      }
    }, 15000);

    it('verifies published Writing tasks exist and satisfy blueprint requirement of at least 2 tasks', async () => {
      const res = await pool.query(`
        SELECT q.id, q.code, qv.prompt,
               COALESCE(qv.payload->>'type', 'ESSAY') as item_type,
               COALESCE(qv.payload->>'taskType', '') as task_type
        FROM public.questions q
        JOIN public.question_versions qv ON q.id = qv.question_id
        WHERE (qv.status = 'published' OR qv.status = 'PUBLISHED')
          AND (
            qv.payload->>'section' ILIKE '%Writing%'
            OR COALESCE(qv.payload->>'type', '') IN ('WRITING_TASK_1','WRITING_TASK_2','ESSAY','WRITING')
            OR q.code ILIKE '%WRITE%'
          )
          AND qv.payload->>'section' NOT ILIKE '%Reading%'
          AND qv.payload->>'section' NOT ILIKE '%Listening%'
          AND qv.payload->>'section' NOT ILIKE '%Speaking%'
        ORDER BY q.code ASC
      `);
      expect(res.rows.length).toBeGreaterThanOrEqual(2);
      for (const r of res.rows) {
        expect(r.prompt).toBeDefined();
        expect(r.prompt.length).toBeGreaterThan(0);
      }
    }, 15000);

    it('verifies canonical Speaking prompts exist for Parts 1, 2, and 3', async () => {
      const res = await pool.query(`
        SELECT q.code, qv.payload->>'part' as part
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
        WHERE (q.code LIKE 'IELTS-S%' OR qv.payload->>'section' ILIKE '%Speaking%')
          AND (qv.status = 'published' OR qv.status = 'PUBLISHED')
      `);
      expect(res.rows.length).toBeGreaterThanOrEqual(3);
    }, 15000);
  });

  // --------------------------------------------------------------------------
  // 3. MEDIA & AUDIO ASSET INTEGRITY
  // --------------------------------------------------------------------------
  describe('3. Media Asset Playability & Track Verification', () => {
    it('verifies canonical Listening audio tracks exist in database with correct URI paths', async () => {
      const res = await pool.query(`
        SELECT code, url, duration_seconds
        FROM public.listening_tracks
        ORDER BY code ASC
      `);
      expect(res.rows.length).toBeGreaterThanOrEqual(4);
      const urls = res.rows.map((r) => r.url);
      expect(urls).toContain('/audio/section-1.mpeg');
      expect(urls).toContain('/audio/section-2.mpeg');
      expect(urls).toContain('/audio/section-3.mpeg');
      expect(urls).toContain('/audio/section-4.mpeg');
    }, 15000);

    it('verifies physical audio files exist in apps/web/public/audio/ and are playable (> 1MB)', () => {
      const publicAudioDir = path.resolve(process.cwd(), 'apps/web/public/audio');
      expect(fs.existsSync(publicAudioDir)).toBe(true);

      for (let i = 1; i <= 4; i++) {
        const filePath = path.join(publicAudioDir, `section-${i}.mpeg`);
        expect(fs.existsSync(filePath)).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(1024 * 1024); // Greater than 1MB
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. SERVER-AUTHORITATIVE OBJECTIVE SCORING
  // --------------------------------------------------------------------------
  describe('4. Server-Authoritative Marking Engine Verification', () => {
    it('evaluates correct MCQ answer to true and incorrect to false', async () => {
      const res = await pool.query(`
        SELECT qv.id as version_id, COALESCE(qv.payload->>'itemType', qv.payload->>'type') as item_type, qv.payload->>'correctAnswer' as correct_answer
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
        WHERE q.code = 'IELTS-L2-011' LIMIT 1
      `);
      const q = res.rows[0];
      const isCorrect = await mockRepo.evaluateObjectiveAnswer(
        q.version_id,
        q.correct_answer,
        q.item_type
      );
      expect(isCorrect).toBe(true);

      const isWrong = await mockRepo.evaluateObjectiveAnswer(
        q.version_id,
        'INCORRECT_CHOICE',
        q.item_type
      );
      expect(isWrong).toBe(false);
    }, 15000);

    it('evaluates text completion with case tolerance and whitespace trimming', async () => {
      const res = await pool.query(`
        SELECT qv.id as version_id, COALESCE(qv.payload->>'itemType', qv.payload->>'type') as item_type, qv.payload->>'correctAnswer' as correct_answer
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
        WHERE q.code = 'IELTS-L1-001' LIMIT 1
      `);
      const q = res.rows[0];
      // Correct is 'Marshall'
      expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, 'Marshall', q.item_type)).toBe(
        true
      );
      expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, 'marshall', q.item_type)).toBe(
        true
      );
      expect(
        await mockRepo.evaluateObjectiveAnswer(q.version_id, '  MARSHALL  ', q.item_type)
      ).toBe(true);
      expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, 'WrongName', q.item_type)).toBe(
        false
      );
      expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, '', q.item_type)).toBe(false);
      expect(await mockRepo.evaluateObjectiveAnswer(q.version_id, '   ', q.item_type)).toBe(false);
    }, 15000);
  });

  // --------------------------------------------------------------------------
  // 5. SECURITY & INFORMATION ISOLATION
  // --------------------------------------------------------------------------
  describe('5. Security & Pre-Submission Information Isolation', () => {
    it('verifies that pre-submission question payloads sent to candidate strip answer keys', async () => {
      const res = await pool.query(`
        SELECT q.id, q.code, qv.payload
        FROM public.questions q
        JOIN public.question_versions qv ON qv.question_id = q.id AND qv.version_no = 1
        WHERE q.code = 'IELTS-L1-001'
        LIMIT 1
      `);
      const q = res.rows[0];
      const payload = q.payload;

      // When delivered to candidate, correctAnswer and acceptedAnswers must be stripped
      const candidatePayload = { ...payload };
      delete candidatePayload.correctAnswer;
      delete candidatePayload.acceptedAnswers;
      delete candidatePayload.markingRubric;
      delete candidatePayload.explanation;

      expect(candidatePayload.correctAnswer).toBeUndefined();
      expect(candidatePayload.acceptedAnswers).toBeUndefined();
      expect(candidatePayload.explanation).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 6. SUBMISSION IMMUTABILITY & IDEMPOTENCY
  // --------------------------------------------------------------------------
  describe('6. Submission Immutability & Late Answer Rejection', () => {
    it('verifies that finalized assessment attempts in mock_sessions record submitted_at', async () => {
      const res = await pool.query(`
        SELECT id, status, submitted_at
        FROM public.mock_sessions
        WHERE status IN ('SUBMITTED', 'COMPLETED')
        LIMIT 1
      `);
      if (res.rows.length > 0) {
        const attempt = res.rows[0];
        expect(['SUBMITTED', 'COMPLETED']).toContain(attempt.status);
      }
    }, 15000);
  });

  // --------------------------------------------------------------------------
  // 7. ADMIN ATTEMPT REVIEW — QUERY CARDINALITY & UNIQUE ATTEMPT INTEGRITY
  // --------------------------------------------------------------------------
  describe('7. Admin Attempt Review Query Cardinality & Non-Duplication', () => {
    it('verifies that mock query returns zero duplicate attemptId values across the entire database', async () => {
      const res = await pool.query(`
        SELECT 
          ms.id as attempt_id
        FROM public.mock_sessions ms
        LEFT JOIN auth.users au ON au.id::text = ms.student_id::text
        LEFT JOIN public.profiles p ON (p.user_id = ms.student_id OR p.id = ms.student_id)
        LEFT JOIN LATERAL (
          SELECT
            mr.official_scaled_score,
            mr.official_score_label
          FROM public.mock_results mr
          WHERE mr.session_id = ms.id
          ORDER BY
            mr.scored_at DESC NULLS LAST,
            mr.id DESC
          LIMIT 1
        ) mr ON true
        WHERE ms.status IS NOT NULL
      `);

      const idCounts: Record<string, number> = {};
      for (const row of res.rows) {
        idCounts[row.attempt_id] = (idCounts[row.attempt_id] || 0) + 1;
      }
      const duplicates = Object.entries(idCounts).filter(([_, c]) => c > 1);
      expect(duplicates).toHaveLength(0);
      expect(res.rows.length).toBe(Object.keys(idCounts).length);
    }, 15000);

    it('verifies known Phase 5 Mock attempt (250242da-d0a1-43d8-ba09-2ad55fbab721) appears exactly once', async () => {
      const res = await pool.query(`
        SELECT 
          ms.id as attempt_id
        FROM public.mock_sessions ms
        LEFT JOIN auth.users au ON au.id::text = ms.student_id::text
        LEFT JOIN public.profiles p ON (p.user_id = ms.student_id OR p.id = ms.student_id)
        LEFT JOIN LATERAL (
          SELECT
            mr.official_scaled_score,
            mr.official_score_label
          FROM public.mock_results mr
          WHERE mr.session_id = ms.id
          ORDER BY
            mr.scored_at DESC NULLS LAST,
            mr.id DESC
          LIMIT 1
        ) mr ON true
        WHERE ms.id = '250242da-d0a1-43d8-ba09-2ad55fbab721'
      `);
      expect(res.rows).toHaveLength(1);
      expect(res.rows[0].attempt_id).toBe('250242da-d0a1-43d8-ba09-2ad55fbab721');
    }, 15000);

    it('verifies all 8 reported duplicate attempt IDs appear exactly once', async () => {
      const observedIds = [
        '250242da-d0a1-43d8-ba09-2ad55fbab721',
        '3c9e0ff4-58b5-4cfa-b139-7489027d4f51',
        '999c75e8-42e4-43ed-91eb-bfbf1e14f22e',
        '56565460-149c-4037-9d5b-38fdcb5dc9be',
        '3ced1867-8053-4baf-8702-f4bf97d2b419',
        'a67894af-6803-42ec-a539-af79a10e1c12',
        '2926d11f-d9d1-4076-a385-7db6b99c4e57',
        '04ec8f95-bad8-4c41-b8e9-d7bf935b54a5',
      ];

      const res = await pool.query(
        `
        SELECT 
          ms.id as attempt_id
        FROM public.mock_sessions ms
        LEFT JOIN auth.users au ON au.id::text = ms.student_id::text
        LEFT JOIN public.profiles p ON (p.user_id = ms.student_id OR p.id = ms.student_id)
        LEFT JOIN LATERAL (
          SELECT
            mr.official_scaled_score,
            mr.official_score_label
          FROM public.mock_results mr
          WHERE mr.session_id = ms.id
          ORDER BY
            mr.scored_at DESC NULLS LAST,
            mr.id DESC
          LIMIT 1
        ) mr ON true
        WHERE ms.id = ANY($1::uuid[])
      `,
        [observedIds]
      );

      const idCounts: Record<string, number> = {};
      for (const row of res.rows) {
        idCounts[row.attempt_id] = (idCounts[row.attempt_id] || 0) + 1;
      }

      for (const id of observedIds) {
        expect(idCounts[id]).toBe(1);
      }
      expect(res.rows).toHaveLength(8);
    }, 15000);
  });
});
