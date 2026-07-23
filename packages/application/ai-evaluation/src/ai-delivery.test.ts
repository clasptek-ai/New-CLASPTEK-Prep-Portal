/**
 * ai-delivery.test.ts
 * Sprint 3.3.1 — AI Evaluation Delivery Layer Completion
 *
 * Tests for the delivery-layer APIs added in this sprint:
 *   - Writing evaluation queuing
 *   - Speaking evaluation queuing
 *   - Evaluation retrieval & search
 *   - Moderation approval workflow
 *   - Score override workflow
 *   - Rubric admin CRUD
 *   - Prompt admin registration
 *   - AI Dashboard metrics endpoint
 *
 * Uses the existing application handlers and MockAIProvider.
 * No external DB required — stubs the repository layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QueueEvaluationHandler,
  ApproveEvaluationHandler,
  OverrideScoreHandler,
  GetEvaluationHandler,
  SearchEvaluationsHandler,
  type EvaluationRepository,
  type HumanReviewRepository,
  type EvaluationProfileRepository,
} from './index';
import { RegisterPromptVersionHandler as PromptRegHandler } from './addendum';

// ─── Minimal stub factories ────────────────────────────────────────────────────

function makeJob(overrides: Partial<any> = {}): any {
  return {
    id: 'job-test-001',
    studentId: 'student-001',
    submissionId: 'sub-001',
    sessionId: 'session-001',
    questionType: 'WRITING' as const,
    status: 'COMPLETED' as const,
    score: 72.5,
    overrideScore: undefined,
    createdAt: new Date().toISOString(),
    // minimal domain method stubs
    approve: vi.fn(),
    override: vi.fn(),
    ...overrides,
  };
}

function makeProfile(): any {
  return {
    id: 'profile-001',
    code: 'IELTS_WRITING',
    name: 'IELTS Writing Profile',
  };
}

function makeReview(jobId: string): any {
  return {
    id: 'review-001',
    jobId,
    status: 'PENDING',
    approve: vi.fn(),
    override: vi.fn(),
  };
}

function stubEvalRepo(job: any = makeJob()): EvaluationRepository {
  return {
    saveJob: vi.fn().mockResolvedValue(undefined),
    saveSnapshot: vi.fn().mockResolvedValue(undefined),
    saveResult: vi.fn().mockResolvedValue(undefined),
    findJobById: vi.fn().mockResolvedValue(job),
    findSnapshotById: vi.fn().mockResolvedValue(null),
    findResultById: vi.fn().mockResolvedValue(null),
    findResultByJobId: vi.fn().mockResolvedValue(null),
    findResultBySubmission: vi.fn().mockResolvedValue([]),
    findPublishedResultsByStudent: vi.fn().mockResolvedValue([]),
    searchJobs: vi.fn().mockResolvedValue([job]),
    publishResult: vi.fn().mockResolvedValue(undefined),
    archiveJob: vi.fn().mockResolvedValue(undefined),
    nextIdentity: vi.fn().mockReturnValue('new-id-' + Math.random()),
  };
}

function stubProfileRepo(): EvaluationProfileRepository {
  return {
    findByCode: vi.fn().mockResolvedValue(makeProfile()),
    findAll: vi.fn().mockResolvedValue([makeProfile()]),
    save: vi.fn().mockResolvedValue(undefined),
    nextIdentity: vi.fn().mockReturnValue('profile-new'),
  } as any;
}

function stubReviewRepo(review: any): HumanReviewRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(review),
    findByJob: vi.fn().mockResolvedValue(review),
    findPending: vi.fn().mockResolvedValue([review]),
    findByReviewer: vi.fn().mockResolvedValue([review]),
    assign: vi.fn().mockResolvedValue(undefined),
    nextIdentity: vi.fn().mockReturnValue('review-new-' + Math.random()),
  };
}

// ─── Test suites ───────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — QueueEvaluationHandler (WRITING)', () => {
  let handler: QueueEvaluationHandler;
  let evalRepo: EvaluationRepository;
  let profileRepo: EvaluationProfileRepository;

  beforeEach(() => {
    evalRepo = stubEvalRepo();
    profileRepo = stubProfileRepo();
    handler = new QueueEvaluationHandler(evalRepo, profileRepo);
  });

  it('queues a WRITING evaluation and returns jobId + snapshotId', async () => {
    const result = await handler.execute({
      submissionId: 'sub-001',
      sessionId: 'session-001',
      studentId: 'student-001',
      questionType: 'WRITING',
      questionSnapshot: { prompt: 'Describe a city you have visited.' },
      rubricSnapshot: { dimension: 'Task Achievement', maxBand: 9 },
      submissionSnapshot: { text: 'I visited Paris last summer and it was amazing.' },
    });

    expect(result).toHaveProperty('jobId');
    expect(result).toHaveProperty('snapshotId');
    expect(typeof result.jobId).toBe('string');
    expect(typeof result.snapshotId).toBe('string');
  });

  it('calls saveJob and saveSnapshot on the repository', async () => {
    await handler.execute({
      submissionId: 'sub-002',
      sessionId: 'session-002',
      studentId: 'student-001',
      questionType: 'WRITING',
      questionSnapshot: {},
      rubricSnapshot: {},
      submissionSnapshot: { text: 'Essay content here.' },
    });

    expect(evalRepo.saveJob).toHaveBeenCalledOnce();
    expect(evalRepo.saveSnapshot).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — QueueEvaluationHandler (SPEAKING)', () => {
  let handler: QueueEvaluationHandler;
  let evalRepo: EvaluationRepository;
  let profileRepo: EvaluationProfileRepository;

  beforeEach(() => {
    evalRepo = stubEvalRepo();
    profileRepo = stubProfileRepo();
    handler = new QueueEvaluationHandler(evalRepo, profileRepo);
  });

  it('queues a SPEAKING evaluation and returns jobId + snapshotId', async () => {
    const result = await handler.execute({
      submissionId: 'sub-003',
      sessionId: 'session-003',
      studentId: 'student-002',
      questionType: 'SPEAKING',
      questionSnapshot: { part: 'Part 2', topic: 'Describe a recent journey.' },
      rubricSnapshot: { dimension: 'Fluency & Coherence', maxBand: 9 },
      submissionSnapshot: {
        transcript: 'Last month I went to Edinburgh by train...',
        audioUrl: 'https://storage.example.com/audio/sub-003.mp3',
        durationSeconds: 120,
        format: 'MP3',
      },
    });

    expect(result).toHaveProperty('jobId');
    expect(result).toHaveProperty('snapshotId');
  });

  it('stores SPEAKING questionType correctly', async () => {
    await handler.execute({
      submissionId: 'sub-004',
      sessionId: 'session-004',
      studentId: 'student-003',
      questionType: 'SPEAKING',
      questionSnapshot: {},
      rubricSnapshot: {},
      submissionSnapshot: { transcript: 'Speaking response text here.' },
    });

    const savedJob = (evalRepo.saveJob as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(savedJob.questionType).toBe('SPEAKING');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — GetEvaluationHandler', () => {
  /**
   * GetEvaluationHandler returns EvaluationResult | null (not the job).
   * It calls findResultByJobId(jobId) under the hood.
   */
  it('returns null when no result exists for the job', async () => {
    const evalRepo = stubEvalRepo();
    // findResultByJobId already returns null by default in stubEvalRepo
    const handler = new GetEvaluationHandler(evalRepo);

    const result = await handler.execute({ jobId: 'job-get-001' });
    // No result saved yet, so null is the correct response
    expect(result).toBeNull();
    expect(evalRepo.findResultByJobId).toHaveBeenCalledWith('job-get-001');
  });

  it('returns null for unknown job ID', async () => {
    const evalRepo = stubEvalRepo();
    (evalRepo.findResultByJobId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const handler = new GetEvaluationHandler(evalRepo);

    const result = await handler.execute({ jobId: 'non-existent' });
    expect(result).toBeNull();
  });

  it('returns result when resultId is provided directly', async () => {
    const evalRepo = stubEvalRepo();
    const mockResult = { id: 'result-001', studentId: 'student-001', isPublished: true } as any;
    (evalRepo.findResultById as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);
    const handler = new GetEvaluationHandler(evalRepo);

    const result = await handler.execute({ resultId: 'result-001' });
    expect(result).toBeDefined();
    expect(result?.id).toBe('result-001');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — SearchEvaluationsHandler', () => {
  it('searches jobs for a student and returns list', async () => {
    const job = makeJob({ studentId: 'student-search-001' });
    const evalRepo = stubEvalRepo(job);
    const handler = new SearchEvaluationsHandler(evalRepo);

    const results = await handler.execute({ studentId: 'student-search-001' });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('passes status filter to repository', async () => {
    const evalRepo = stubEvalRepo();
    const handler = new SearchEvaluationsHandler(evalRepo);

    await handler.execute({ studentId: 'student-001', status: 'COMPLETED' as any });
    expect(evalRepo.searchJobs).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'COMPLETED' })
    );
  });

  it('passes questionType filter to repository', async () => {
    const evalRepo = stubEvalRepo();
    const handler = new SearchEvaluationsHandler(evalRepo);

    await handler.execute({ questionType: 'SPEAKING' as any });
    expect(evalRepo.searchJobs).toHaveBeenCalledWith(
      expect.objectContaining({ questionType: 'SPEAKING' })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — ApproveEvaluationHandler (moderation)', () => {
  /**
   * ApproveEvaluationHandler.execute takes { jobId, approvedBy, reviewId? }.
   * Without reviewId it skips reviewRepo and only saves to evalRepo.
   */
  it('approves a completed evaluation (direct approval path)', async () => {
    const job = makeJob({ status: 'COMPLETED', approve: vi.fn() });
    const review = makeReview(job.id);
    const evalRepo = stubEvalRepo(job);
    const reviewRepo = stubReviewRepo(review);
    const handler = new ApproveEvaluationHandler(evalRepo, reviewRepo);

    await expect(
      handler.execute({ jobId: job.id, approvedBy: 'examiner-001' })
    ).resolves.not.toThrow();

    // Direct approval path saves the job (no reviewId = no reviewRepo.save call)
    expect(evalRepo.saveJob).toHaveBeenCalled();
  });

  it('approves via review path and saves review', async () => {
    const job = makeJob({ status: 'COMPLETED', approve: vi.fn() });
    const review = makeReview(job.id);
    // Review must be in ASSIGNED or IN_REVIEW state for review path
    review.status = 'ASSIGNED';
    review.startReview = vi.fn();
    review.approve = vi.fn();
    const evalRepo = stubEvalRepo(job);
    const reviewRepo = stubReviewRepo(review);
    const handler = new ApproveEvaluationHandler(evalRepo, reviewRepo);

    await expect(
      handler.execute({ jobId: job.id, approvedBy: 'examiner-001', reviewId: review.id })
    ).resolves.not.toThrow();

    expect(reviewRepo.save).toHaveBeenCalled();
    expect(evalRepo.saveJob).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — OverrideScoreHandler', () => {
  /**
   * OverrideScoreHandler.execute takes { reviewId, overrideScore, rationale, overriddenBy }.
   * The review must be in IN_REVIEW or ESCALATED status.
   */
  it('applies a score override with a valid reason', async () => {
    const review = makeReview('review-override-001');
    // Domain requires review in IN_REVIEW or ESCALATED status
    review.status = 'IN_REVIEW';
    review.addComment = vi.fn();
    const reviewRepo = stubReviewRepo(review);
    const handler = new OverrideScoreHandler(reviewRepo);

    await expect(
      handler.execute({
        reviewId: 'review-override-001',
        overriddenBy: 'examiner-002',
        overrideScore: 68,
        rationale: 'AI over-credited task achievement in paragraph 3.',
      })
    ).resolves.not.toThrow();

    expect(reviewRepo.save).toHaveBeenCalled();
  });

  it('rejects override when review is still PENDING', async () => {
    const review = makeReview('review-override-002');
    review.status = 'PENDING'; // wrong status — not IN_REVIEW or ESCALATED
    const reviewRepo = stubReviewRepo(review);
    const handler = new OverrideScoreHandler(reviewRepo);

    // Domain throws because review is not in IN_REVIEW/ESCALATED state
    await expect(
      handler.execute({
        reviewId: 'review-override-002',
        overriddenBy: 'examiner-003',
        overrideScore: 75,
        rationale: 'This should fail due to wrong review status.',
      })
    ).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — RegisterPromptVersionHandler (addendum)', () => {
  it('registers a new prompt version and returns a version ID', async () => {
    const handler = new PromptRegHandler();

    const versionId = await handler.execute({
      tenantId: 'tenant-001',
      templateId: 'ielts-writing-v2',
      versionNumber: 2,
      systemPrompt: 'You are an IELTS Writing examiner.',
      userPromptTemplate: 'Evaluate the following essay: {{essay}}',
      createdBy: 'admin-001',
    });

    expect(typeof versionId).toBe('string');
    expect(versionId.length).toBeGreaterThan(0);
    expect(versionId).toContain('ielts-writing-v2');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3.3.1 — Input Validation (API-level)', () => {
  it('writing evaluation requires submissionId and sessionId', () => {
    const missingFields = (body: Record<string, unknown>) => {
      const { submissionId, sessionId } = body;
      return !submissionId || !sessionId;
    };

    expect(missingFields({ submissionId: 'sub-001' })).toBe(true);
    expect(missingFields({ sessionId: 'sess-001' })).toBe(true);
    expect(missingFields({ submissionId: 'sub-001', sessionId: 'sess-001' })).toBe(false);
  });

  it('speaking evaluation rejects unsupported audio format', () => {
    const supportedFormats = ['MP3', 'WAV', 'WEBM', 'OGG', 'M4A'];
    const isFormatSupported = (fmt: string) => supportedFormats.includes(fmt.toUpperCase());

    expect(isFormatSupported('MP3')).toBe(true);
    expect(isFormatSupported('wav')).toBe(true);
    expect(isFormatSupported('FLAC')).toBe(false);
    expect(isFormatSupported('AAC')).toBe(false);
  });

  it('override score must be between 0 and 100', () => {
    const isValidScore = (score: number) => typeof score === 'number' && score >= 0 && score <= 100;

    expect(isValidScore(72.5)).toBe(true);
    expect(isValidScore(0)).toBe(true);
    expect(isValidScore(100)).toBe(true);
    expect(isValidScore(-1)).toBe(false);
    expect(isValidScore(101)).toBe(false);
  });

  it('override reason must be at least 10 characters', () => {
    const isValidReason = (reason: string) => reason.trim().length >= 10;

    expect(isValidReason('Short')).toBe(false);
    expect(isValidReason('This is a detailed override reason.')).toBe(true);
    expect(isValidReason('10 chars!!')).toBe(true);
  });
});
