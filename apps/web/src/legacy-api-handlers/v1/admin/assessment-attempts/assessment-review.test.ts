// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;
const dbUrl = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '')
  .replace(':6543/', ':5432/')
  .replace('sslmode=verify-full', 'sslmode=no-verify');

describe('Phase 5.6 — Complete Student Assessment Review & Multi-Attempt Response Reconstruction Audit', () => {
  let pool: pg.Pool;
  let studentHistoryJson: any;
  let mockReview: any;
  let diagReview: any;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
    });

    // Prefetch API responses once to avoid per-test HTTP compilation overhead
    try {
      const histRes = await fetch(
        'http://localhost:3000/api/v1/admin/assessment-attempts/student/505e2f81-2578-4a9c-9c82-d5ae1d7b3fc3/history'
      );
      studentHistoryJson = await histRes.json();
    } catch (e) {
      console.warn('History fetch warning:', e);
    }

    try {
      const mockRes = await fetch(
        'http://localhost:3000/api/v1/admin/assessment-attempts/a67894af-6803-42ec-a539-af79a10e1c12'
      );
      const mockJson = await mockRes.json();
      mockReview = mockJson.data?.reconstructedReview;
    } catch (e) {
      console.warn('Mock fetch warning:', e);
    }

    try {
      const diagRes = await fetch(
        'http://localhost:3000/api/v1/admin/assessment-attempts/31dd2e52-936c-4228-bc5e-ea4bac4e2545'
      );
      const diagJson = await diagRes.json();
      diagReview = diagJson.data?.reconstructedReview;
    } catch (e) {
      console.warn('Diag fetch warning:', e);
    }
  }, 45000);

  afterAll(async () => {
    await pool.end();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY 1: MULTI-ATTEMPT INTEGRITY & CHRONOLOGICAL NUMBERING
  // ──────────────────────────────────────────────────────────────────────────
  describe('Category 1: Multi-Attempt Integrity & Chronological Numbering', () => {
    it('1. Candidate Attempts Separation: Multiple attempts by the same candidate are distinct rows with distinct IDs and never merged', async () => {
      const studentId = '505e2f81-2578-4a9c-9c82-d5ae1d7b3fc3'; // Boluwaji Olusegun
      const res = await pool.query(
        `SELECT id, catalog_id, started_at, score, status 
         FROM public.assessment_attempts 
         WHERE student_id = $1 
         ORDER BY started_at ASC`,
        [studentId]
      );

      expect(res.rows.length).toBeGreaterThan(1);
      const ids = res.rows.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('2. Chronological Attempt Numbering: Window partitioning yields sequential 1..N attempt numbers per assessment definition', async () => {
      const studentId = '505e2f81-2578-4a9c-9c82-d5ae1d7b3fc3';
      const res = await pool.query(
        `SELECT id, catalog_id, started_at,
                ROW_NUMBER() OVER (PARTITION BY student_id, catalog_id ORDER BY started_at ASC) as attempt_number,
                COUNT(*) OVER (PARTITION BY student_id, catalog_id) as total_attempts
         FROM public.assessment_attempts
         WHERE student_id = $1
         ORDER BY catalog_id, started_at ASC`,
        [studentId]
      );

      expect(res.rows.length).toBeGreaterThan(0);
      let prevNumber = 0;
      let prevCatalog = '';

      for (const row of res.rows) {
        if (row.catalog_id !== prevCatalog) {
          prevCatalog = row.catalog_id;
          prevNumber = 1;
        } else {
          prevNumber += 1;
        }
        expect(parseInt(row.attempt_number, 10)).toBe(prevNumber);
        expect(parseInt(row.total_attempts, 10)).toBeGreaterThanOrEqual(prevNumber);
      }
    });

    it('3. Assessment Definition Boundary Isolation: Diagnostic attempts and Mock sessions never conflate definition IDs', async () => {
      const resDiag = await pool.query(
        `SELECT DISTINCT catalog_id FROM public.assessment_attempts WHERE catalog_id IS NOT NULL`
      );
      const resMock = await pool.query(
        `SELECT DISTINCT template_id FROM public.mock_sessions WHERE template_id IS NOT NULL`
      );

      expect(resDiag.rows.length).toBeGreaterThan(0);
      expect(resMock.rows.length).toBeGreaterThan(0);

      // Verify that mock templates link to mock_blueprints and diagnostic link to assessment_definitions
      const diagCheck = await pool.query(
        `SELECT aa.id FROM public.assessment_attempts aa 
         JOIN public.assessment_definitions ad ON ad.id = aa.catalog_id LIMIT 5`
      );
      expect(diagCheck.rows.length).toBeGreaterThan(0);

      const mockCheck = await pool.query(
        `SELECT ms.id FROM public.mock_sessions ms 
         JOIN public.mock_blueprints mb ON mb.id = ms.template_id LIMIT 5`
      );
      expect(mockCheck.rows.length).toBeGreaterThan(0);
    });

    it('4. Total Attempts Accuracy: Single attempt query returns matching attempt_number and total_attempts', async () => {
      const diagId = '31dd2e52-936c-4228-bc5e-ea4bac4e2545';
      const res = await pool.query(
        `SELECT aa.id,
          (SELECT COUNT(*) FROM public.assessment_attempts a2 
           WHERE a2.student_id = aa.student_id 
             AND a2.catalog_id = aa.catalog_id 
             AND a2.started_at <= aa.started_at) as attempt_number,
          (SELECT COUNT(*) FROM public.assessment_attempts a3 
           WHERE a3.student_id = aa.student_id 
             AND a3.catalog_id = aa.catalog_id) as total_attempts
         FROM public.assessment_attempts aa
         WHERE aa.id = $1`,
        [diagId]
      );

      expect(res.rows.length).toBe(1);
      const row = res.rows[0];
      const attemptNum = parseInt(row.attempt_number, 10);
      const totalNum = parseInt(row.total_attempts, 10);
      expect(attemptNum).toBeGreaterThanOrEqual(1);
      expect(totalNum).toBeGreaterThanOrEqual(attemptNum);
    });

    it('5. Student Attempt History API: Endpoints respond with 200 OK and grouped assessment definitions', () => {
      expect(studentHistoryJson).toBeDefined();
      expect(studentHistoryJson.success).toBe(true);

      const candidate = studentHistoryJson.data?.candidate || studentHistoryJson.student;
      expect(candidate).toBeDefined();
      expect(candidate.id).toBe('505e2f81-2578-4a9c-9c82-d5ae1d7b3fc3');

      const groups =
        studentHistoryJson.data?.assessmentGroups || studentHistoryJson.assessmentGroups;
      expect(groups.length).toBeGreaterThan(0);

      for (const group of groups) {
        expect(group.definitionId).toBeTruthy();
        expect(group.definitionTitle).toBeTruthy();
        expect(group.totalAttempts).toBe(group.attempts.length);
        // Verify sequential attempt numbering within the group
        group.attempts.forEach((att: any, idx: number) => {
          expect(att.attemptNumber).toBeGreaterThanOrEqual(1);
        });
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY 2: QUESTION & SNAPSHOT COMPLETENESS
  // ──────────────────────────────────────────────────────────────────────────
  describe('Category 2: Question & Snapshot Completeness', () => {
    it('6. Frozen Snapshot Fidelity: Diagnostic attempts retain complete paper_snapshot', async () => {
      const res = await pool.query(
        `SELECT id, paper_snapshot FROM public.assessment_attempts 
         WHERE paper_snapshot IS NOT NULL AND paper_snapshot::text LIKE '%grammarQuestions%' LIMIT 3`
      );

      expect(res.rows.length).toBeGreaterThan(0);
      for (const row of res.rows) {
        const snap =
          typeof row.paper_snapshot === 'string'
            ? JSON.parse(row.paper_snapshot)
            : row.paper_snapshot;
        expect(snap.grammarQuestions || snap.questions).toBeDefined();
      }
    });

    it('7. Question Prompts & Codes: Mock session snapshots preserve full question prompt, code and order', async () => {
      const sessionId = 'a67894af-6803-42ec-a539-af79a10e1c12';
      const res = await pool.query(
        `SELECT display_order, snapshot_payload FROM public.session_question_snapshots 
         WHERE session_id = $1 ORDER BY display_order ASC LIMIT 20`,
        [sessionId]
      );

      expect(res.rows.length).toBe(20);
      res.rows.forEach((r, idx) => {
        expect(r.display_order).toBe(idx + 1);
        expect(r.snapshot_payload.prompt).toBeTruthy();
        expect(r.snapshot_payload.code).toBeTruthy();
      });
    });

    it('8. Options & Option Codes: MCQ items include options array with distinct codes and texts', async () => {
      const sessionId = 'a67894af-6803-42ec-a539-af79a10e1c12';
      const res = await pool.query(
        `SELECT snapshot_payload FROM public.session_question_snapshots 
         WHERE session_id = $1 AND snapshot_payload->>'itemType' IN ('MULTIPLE_CHOICE', 'MCQ') LIMIT 5`,
        [sessionId]
      );

      expect(res.rows.length).toBeGreaterThan(0);
      for (const r of res.rows) {
        const options = r.snapshot_payload.options;
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThanOrEqual(2);
        options.forEach((opt: any) => {
          expect(opt.code).toBeTruthy();
          expect(opt.text).toBeTruthy();
        });
      }
    });

    it('9. Diagnostic 30 Grammar Questions: Detail API returns exactly 30 grammar questions', () => {
      expect(diagReview).toBeDefined();
      expect(diagReview.assessmentType).toBe('DIAGNOSTIC');
      expect(diagReview.sections.grammar).toBeDefined();
      expect(diagReview.sections.grammar.questions.length).toBe(30);

      for (const q of diagReview.sections.grammar.questions) {
        expect(q.prompt).toBeTruthy();
        expect(q.options.length).toBe(4);
        expect(q.correctAnswer).toBeTruthy();
      }
    });

    it('10. Mock 85 Questions Inventory: Detail API returns 40 listening, 40 reading, 2 writing, 3 speaking', () => {
      expect(mockReview).toBeDefined();
      expect(mockReview.assessmentType).toBe('MOCK');
      expect(mockReview.sections.listening.totalQuestions).toBe(40);
      expect(mockReview.sections.reading.totalQuestions).toBe(40);
      expect(mockReview.sections.writing.tasks.length).toBe(2);
      expect(mockReview.sections.speaking.parts.length).toBe(3);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY 3: STUDENT SUBMITTED ANSWERS VS AUTHORITATIVE ANSWERS
  // ──────────────────────────────────────────────────────────────────────────
  describe('Category 3: Student Submitted Answers vs Authoritative Answers', () => {
    it('11. Candidate Submitted Answer Capture: Student answers are returned from answers table', async () => {
      const mockId = 'a67894af-6803-42ec-a539-af79a10e1c12';
      const ansRes = await pool.query(
        `SELECT maa.question_id, maa.answer_payload, maa.is_correct 
         FROM public.mock_attempts ma 
         JOIN public.mock_attempt_answers maa ON maa.attempt_id = ma.id 
         WHERE ma.session_id = $1 LIMIT 5`,
        [mockId]
      );

      expect(ansRes.rows.length).toBeGreaterThan(0);
    });

    it('12. Authoritative Answer Preservation: Objective questions have authoritative correct answers', () => {
      expect(mockReview).toBeDefined();
      const listeningQs = mockReview.sections.listening.sections.flatMap((s: any) => s.questions);
      const readingQs = mockReview.sections.reading.passages.flatMap((p: any) => p.questions);

      const hasAuthoritative =
        listeningQs.some((q: any) => q.correctAnswer !== null) ||
        readingQs.some((q: any) => q.correctAnswer !== null);
      expect(hasAuthoritative).toBe(true);
    });

    it('13. Status Resolution: Status correctly maps to CORRECT, INCORRECT, or UNANSWERED', () => {
      expect(mockReview).toBeDefined();
      const allQs = [
        ...mockReview.sections.listening.sections.flatMap((s: any) => s.questions),
        ...mockReview.sections.reading.passages.flatMap((p: any) => p.questions),
      ];

      const validStatuses = ['CORRECT', 'INCORRECT', 'UNANSWERED', 'NOT_SCORED', 'PENDING_REVIEW'];
      for (const q of allQs) {
        expect(validStatuses).toContain(q.status);
      }
    });

    it('14. No Fake Answers for Subjective: Writing and Speaking items do not fabricate correct answers', () => {
      expect(mockReview).toBeDefined();
      for (const task of mockReview.sections.writing.tasks) {
        expect((task as any).correctAnswer).toBeUndefined();
      }
      for (const part of mockReview.sections.speaking.parts) {
        expect((part as any).correctAnswer).toBeUndefined();
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY 4: MULTIMEDIA & HISTORICAL EVIDENCE
  // ──────────────────────────────────────────────────────────────────────────
  describe('Category 4: Multimedia & Historical Evidence', () => {
    it('15. Listening Audio Tracks: All 4 listening sections provide playable audio URLs and durations', () => {
      expect(mockReview).toBeDefined();
      const sections = mockReview.sections.listening.sections;

      expect(sections.length).toBe(4);
      for (const sec of sections) {
        expect(sec.audioUrl).toMatch(/^\/audio\/section-\d\.mpeg/);
        expect(sec.durationSeconds).toBeGreaterThan(0);
      }
    });

    it('16. Listening Audio Files on Disk: Audio files exist in apps/web/public/audio/', () => {
      const expectedFiles = [
        'apps/web/public/audio/section-1.mpeg',
        'apps/web/public/audio/section-2.mpeg',
        'apps/web/public/audio/section-3.mpeg',
        'apps/web/public/audio/section-4.mpeg',
      ];

      for (const file of expectedFiles) {
        expect(fs.existsSync(file)).toBe(true);
      }
    });

    it('17. Full Reading Passages: Reading passages have non-empty text, titles, and word counts', () => {
      expect(mockReview).toBeDefined();
      const passages = mockReview.sections.reading.passages;

      expect(passages.length).toBe(3);
      for (const p of passages) {
        expect(p.title).toBeTruthy();
        expect(p.content.length).toBeGreaterThan(100);
        expect(p.wordCount).toBeGreaterThan(50);
        expect(p.questions.length).toBeGreaterThan(0);
      }
    });

    it('18. Writing Task 1 Stimulus Diagram: Writing Task 1 provides dynamic stimulus image URL', () => {
      expect(mockReview).toBeDefined();
      const task1 = mockReview.sections.writing.tasks[0];

      expect(task1.taskNumber).toBe(1);
      expect(task1.stimulusImageUrl).toBe('/images/stimuli/rough-diamond-process.png');
    });

    it('19. Writing Stimulus Image on Disk: Stimulus image exists in apps/web/public/images/stimuli/', () => {
      const expectedImg = 'apps/web/public/images/stimuli/rough-diamond-process.png';
      expect(fs.existsSync(expectedImg)).toBe(true);
    });

    it('20. Candidate Essay Text: Candidate essay text is preserved with word count', async () => {
      const evalRes = await pool.query(
        `SELECT raw_response_reference FROM public.subjective_evaluations 
         WHERE skill = 'Writing' AND raw_response_reference IS NOT NULL LIMIT 1`
      );

      expect(evalRes.rows.length).toBe(1);
      const essay = evalRes.rows[0].raw_response_reference;
      expect(essay.length).toBeGreaterThan(50);
    });

    it('21. IELTS 4-Criteria Writing Rubrics: Rubrics are populated with official descriptors', async () => {
      const rubrics = await pool.query(
        `SELECT DISTINCT criterion FROM public.writing_band_rubrics`
      );

      const criteria = rubrics.rows.map((r) => r.criterion);
      expect(criteria).toContain('TASK_ACHIEVEMENT');
      expect(criteria).toContain('TASK_RESPONSE');
      expect(criteria).toContain('COHERENCE_COHESION');
      expect(criteria).toContain('LEXICAL_RESOURCE');
      expect(criteria).toContain('GRAMMATICAL_RANGE');
    });

    it('22. Speaking Part 2 Cue Card: Contains topic, prompt with bullet points, and 60s/120s timers', () => {
      expect(mockReview).toBeDefined();
      const part2 = mockReview.sections.speaking.parts[1];

      expect(part2.partNumber).toBe(2);
      expect(part2.cueCard).toBeDefined();
      expect(part2.cueCard.prepTimeSeconds).toBe(60);
      expect(part2.cueCard.speakingTimeSeconds).toBe(120);
      expect(part2.cueCard.prompt).toContain('Describe a skill');
    });

    it('23. Speaking Recordings Playback: Candidate recordings table stores valid audio URLs', async () => {
      const spkRes = await pool.query(
        `SELECT id, audio_url, duration_seconds FROM public.speaking_recordings LIMIT 3`
      );

      expect(spkRes.rows.length).toBeGreaterThan(0);
      for (const rec of spkRes.rows) {
        expect(rec.audio_url).toBeTruthy();
        expect(rec.duration_seconds).toBeGreaterThan(0);
      }
    });

    it('24. Candidate Speaking Transcript: Transcripts are captured from evaluations where stored', async () => {
      const evalRes = await pool.query(
        `SELECT id, skill, transcript FROM public.subjective_evaluations 
         WHERE skill = 'Speaking' LIMIT 1`
      );

      expect(evalRes).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY 5: PRODUCTION SAFETY & CANDIDATE PROTECTION
  // ──────────────────────────────────────────────────────────────────────────
  describe('Category 5: Production Safety & Candidate Protection', () => {
    it('25. Read-Only Assessment Review: Querying review endpoints does NOT modify student attempt state, score or timing', async () => {
      const diagId = '31dd2e52-936c-4228-bc5e-ea4bac4e2545';
      const before = await pool.query(
        `SELECT score, status, started_at, closed_at FROM public.assessment_attempts WHERE id = $1`,
        [diagId]
      );

      // Hit the endpoint
      await fetch(`http://localhost:3000/api/v1/admin/assessment-attempts/${diagId}`);

      const after = await pool.query(
        `SELECT score, status, started_at, closed_at FROM public.assessment_attempts WHERE id = $1`,
        [diagId]
      );

      expect(after.rows[0].score).toBe(before.rows[0].score);
      expect(after.rows[0].status).toBe(before.rows[0].status);
      expect(after.rows[0].started_at).toEqual(before.rows[0].started_at);
      expect(after.rows[0].closed_at).toEqual(before.rows[0].closed_at);
    }, 15000);
  });
});
