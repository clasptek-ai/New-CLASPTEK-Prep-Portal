import { describe, it, expect, vi } from 'vitest';
import {
  EvaluationJob,
  EvaluationResult,
  EvaluationProfile,
  ConfidenceLevel,
  BandScore,
} from '@clasptek/domain-ai-evaluation';
import {
  QueueEvaluationHandler,
  RunEvaluationHandler,
  RequestHumanReviewHandler,
  ApproveEvaluationHandler,
  PublishEvaluationHandler,
  GetFeedbackHandler,
  GetConfidenceHandler,
  SearchEvaluationsHandler,
  type EvaluationRepository,
  type HumanReviewRepository,
  type PromptRepository,
  type EvaluationProfileRepository,
} from './index';

// ═══════════════════════════════════════════════════════════════════
// MOCK REPOSITORIES
// ═══════════════════════════════════════════════════════════════════

const makeEvalRepo = (overrides: Partial<EvaluationRepository> = {}): EvaluationRepository => ({
  saveJob: vi.fn().mockResolvedValue(undefined),
  saveSnapshot: vi.fn().mockResolvedValue(undefined),
  saveResult: vi.fn().mockResolvedValue(undefined),
  findJobById: vi.fn().mockResolvedValue(null),
  findSnapshotById: vi.fn().mockResolvedValue(null),
  findResultById: vi.fn().mockResolvedValue(null),
  findResultByJobId: vi.fn().mockResolvedValue(null),
  findResultBySubmission: vi.fn().mockResolvedValue([]),
  findPublishedResultsByStudent: vi.fn().mockResolvedValue([]),
  searchJobs: vi.fn().mockResolvedValue([]),
  publishResult: vi.fn().mockResolvedValue(undefined),
  archiveJob: vi.fn().mockResolvedValue(undefined),
  nextIdentity: vi.fn().mockReturnValue('gen-id-001'),
  ...overrides,
});

const makeReviewRepo = (overrides: Partial<HumanReviewRepository> = {}): HumanReviewRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue(null),
  findByJob: vi.fn().mockResolvedValue(null),
  findPending: vi.fn().mockResolvedValue([]),
  findByReviewer: vi.fn().mockResolvedValue([]),
  assign: vi.fn().mockResolvedValue(undefined),
  nextIdentity: vi.fn().mockReturnValue('review-gen-001'),
  ...overrides,
});

const makeProfileRepo = (profile?: EvaluationProfile | null): EvaluationProfileRepository => ({
  findById: vi.fn().mockResolvedValue(profile ?? null),
  findByCode: vi.fn().mockResolvedValue(profile ?? null),
  findAll: vi.fn().mockResolvedValue(profile ? [profile] : []),
});

const makePromptRepo = (): PromptRepository => ({
  findByCode: vi.fn().mockResolvedValue(null),
  findCurrentVersion: vi.fn().mockResolvedValue(null),
  saveVersion: vi.fn().mockResolvedValue(undefined),
  saveExecution: vi.fn().mockResolvedValue(undefined),
  findExecutionsByJob: vi.fn().mockResolvedValue([]),
});

// ─── Helpers ───────────────────────────────────────────────────────

const makeQueuedJob = (overrides: Partial<any> = {}): EvaluationJob =>
  EvaluationJob.queue({
    snapshotId: 'snap-1',
    studentId: 'student-1',
    submissionId: 'sub-1',
    questionType: 'ESSAY',
    priority: 5,
    ...overrides,
  });

const makePublishedResult = (): EvaluationResult => {
  const r = new EvaluationResult({
    id: 'result-1',
    jobId: 'job-1',
    snapshotId: 'snap-1',
    studentId: 'student-1',
    submissionId: 'sub-1',
    questionType: 'ESSAY',
    rawScore: 7.0,
    maxScore: 9.0,
    bandScore: new BandScore('7.0', 7.0),
    confidence: new ConfidenceLevel(0.88),
    isPublished: true,
  });
  return r;
};

// ═══════════════════════════════════════════════════════════════════
// QueueEvaluationHandler TESTS
// ═══════════════════════════════════════════════════════════════════

describe('QueueEvaluationHandler', () => {
  it('creates a snapshot and queues a job', async () => {
    const evalRepo = makeEvalRepo();
    const profileRepo = makeProfileRepo();
    const handler = new QueueEvaluationHandler(evalRepo, profileRepo);

    const { jobId, snapshotId } = await handler.execute({
      submissionId: 'sub-1',
      sessionId: 'session-1',
      studentId: 'student-1',
      questionType: 'ESSAY',
      questionSnapshot: { questionId: 'q-1' },
      rubricSnapshot: { criteria: [] },
      submissionSnapshot: { answers: [] },
    });

    expect(jobId).toBeDefined();
    expect(snapshotId).toBeDefined();
    expect(evalRepo.saveSnapshot).toHaveBeenCalledOnce();
    expect(evalRepo.saveJob).toHaveBeenCalledOnce();
  });

  it('resolves profile code when provided', async () => {
    const profile = new EvaluationProfile({
      id: 'prof-1',
      profileCode: 'IELTS_WRITING',
      displayName: 'IELTS Writing',
      confidenceThreshold: 0.8,
      moderationPolicy: 'THRESHOLD_BASED',
      isActive: true,
    });
    const evalRepo = makeEvalRepo();
    const profileRepo = makeProfileRepo(profile);
    const handler = new QueueEvaluationHandler(evalRepo, profileRepo);

    const { jobId } = await handler.execute({
      submissionId: 'sub-2',
      sessionId: 'session-2',
      studentId: 'student-2',
      questionType: 'WRITING',
      questionSnapshot: {},
      rubricSnapshot: {},
      submissionSnapshot: {},
      profileCode: 'IELTS_WRITING',
    });

    expect(jobId).toBeDefined();
    expect(profileRepo.findByCode).toHaveBeenCalledWith('IELTS_WRITING');
  });
});

// ═══════════════════════════════════════════════════════════════════
// RunEvaluationHandler TESTS
// ═══════════════════════════════════════════════════════════════════

describe('RunEvaluationHandler', () => {
  it('fails when job not found', async () => {
    const evalRepo = makeEvalRepo({ findJobById: vi.fn().mockResolvedValue(null) });
    const handler = new RunEvaluationHandler(evalRepo, makeProfileRepo(), makePromptRepo());

    await expect(
      handler.execute({
        jobId: 'nonexistent',
        modelCode: 'gpt-4o',
        provider: 'OPENAI',
        rawScore: 7.0,
        maxScore: 9.0,
        confidence: 0.88,
      })
    ).rejects.toThrow('not found');
  });

  it('runs evaluation and saves result', async () => {
    const job = makeQueuedJob();
    const evalRepo = makeEvalRepo({
      findJobById: vi.fn().mockResolvedValue(job),
    });
    const handler = new RunEvaluationHandler(evalRepo, makeProfileRepo(), makePromptRepo());

    const resultId = await handler.execute({
      jobId: job.id,
      modelCode: 'gpt-4o',
      provider: 'OPENAI',
      rawScore: 7.0,
      maxScore: 9.0,
      bandScore: '7.0',
      confidence: 0.88,
      feedbackSections: [{ sectionType: 'STRENGTHS', content: 'Good structure', orderIndex: 1 }],
      systemPromptHash: 'hash-sys-001',
      userPromptHash: 'hash-usr-001',
      tokenUsage: { promptTokens: 100, completionTokens: 200 },
      latencyMs: 1200,
    });

    expect(resultId).toBeDefined();
    expect(evalRepo.saveResult).toHaveBeenCalledOnce();
    expect(evalRepo.saveJob).toHaveBeenCalledOnce();
  });

  it('records prompt execution audit (Rec 5)', async () => {
    const job = makeQueuedJob();
    const promptRepo = makePromptRepo();
    const evalRepo = makeEvalRepo({ findJobById: vi.fn().mockResolvedValue(job) });
    const handler = new RunEvaluationHandler(evalRepo, makeProfileRepo(), promptRepo);

    await handler.execute({
      jobId: job.id,
      modelCode: 'gpt-4o',
      provider: 'OPENAI',
      rawScore: 7.0,
      maxScore: 9.0,
      confidence: 0.88,
      systemPromptHash: 'sha256-sys',
      userPromptHash: 'sha256-usr',
      tokenUsage: { promptTokens: 100, completionTokens: 150 },
    });

    expect(promptRepo.saveExecution).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════
// RequestHumanReviewHandler TESTS
// ═══════════════════════════════════════════════════════════════════

describe('RequestHumanReviewHandler', () => {
  it('creates a review and transitions job to HUMAN_REVIEW_REQUIRED', async () => {
    const job = makeQueuedJob();
    job.start('gpt-4o');
    job.complete();

    const evalRepo = makeEvalRepo({ findJobById: vi.fn().mockResolvedValue(job) });
    const reviewRepo = makeReviewRepo();
    const handler = new RequestHumanReviewHandler(evalRepo, reviewRepo);

    const reviewId = await handler.execute({
      jobId: job.id,
      resultId: 'result-1',
      reason: 'Low confidence: 0.65',
    });

    expect(reviewId).toBeDefined();
    expect(job.status).toBe('HUMAN_REVIEW_REQUIRED');
    expect(reviewRepo.save).toHaveBeenCalledOnce();
    expect(evalRepo.saveJob).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════
// ApproveEvaluationHandler TESTS
// ═══════════════════════════════════════════════════════════════════

describe('ApproveEvaluationHandler', () => {
  it('approves a completed job directly (no review)', async () => {
    const job = makeQueuedJob();
    job.start('gpt-4o');
    job.complete();

    const evalRepo = makeEvalRepo({ findJobById: vi.fn().mockResolvedValue(job) });
    const handler = new ApproveEvaluationHandler(evalRepo, makeReviewRepo());

    await handler.execute({ jobId: job.id, approvedBy: 'admin-1' });

    expect(job.status).toBe('APPROVED');
    expect(evalRepo.saveJob).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════
// PublishEvaluationHandler TESTS
// ═══════════════════════════════════════════════════════════════════

describe('PublishEvaluationHandler', () => {
  it('publishes an approved job and result', async () => {
    const job = makeQueuedJob();
    job.start('gpt-4o');
    job.complete();
    job.approve('admin-1');

    const unpublishedResult = new EvaluationResult({
      id: 'result-2',
      jobId: job.id,
      snapshotId: 'snap-1',
      studentId: 'student-1',
      submissionId: 'sub-1',
      questionType: 'ESSAY',
      rawScore: 7.0,
      maxScore: 9.0,
      isPublished: false,
    });

    const evalRepo = makeEvalRepo({
      findJobById: vi.fn().mockResolvedValue(job),
      findResultByJobId: vi.fn().mockResolvedValue(unpublishedResult),
    });
    const handler = new PublishEvaluationHandler(evalRepo, makeReviewRepo());

    await handler.execute({ jobId: job.id });

    expect(job.status).toBe('PUBLISHED');
    expect(unpublishedResult.isPublished).toBe(true);
    expect(evalRepo.publishResult).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════
// QUERY HANDLER TESTS
// ═══════════════════════════════════════════════════════════════════

describe('GetFeedbackHandler', () => {
  it('returns feedback for a published result', async () => {
    const result = makePublishedResult();
    const evalRepo = makeEvalRepo({ findResultById: vi.fn().mockResolvedValue(result) });
    const handler = new GetFeedbackHandler(evalRepo);

    const feedback = await handler.execute({ resultId: 'result-1', studentId: 'student-1' });

    expect(feedback).not.toBeNull();
    expect(feedback!.sections).toBeDefined();
    expect(feedback!.recommendations).toBeDefined();
  });

  it('throws when result is not yet published', async () => {
    const result = new EvaluationResult({
      id: 'result-unpublished',
      jobId: 'job-1',
      snapshotId: 'snap-1',
      studentId: 'student-1',
      submissionId: 'sub-1',
      questionType: 'ESSAY',
      isPublished: false,
    });
    const evalRepo = makeEvalRepo({ findResultById: vi.fn().mockResolvedValue(result) });
    const handler = new GetFeedbackHandler(evalRepo);

    await expect(
      handler.execute({ resultId: 'result-unpublished', studentId: 'student-1' })
    ).rejects.toThrow('not been published');
  });

  it('throws on student ownership mismatch', async () => {
    const result = makePublishedResult(); // studentId = 'student-1'
    const evalRepo = makeEvalRepo({ findResultById: vi.fn().mockResolvedValue(result) });
    const handler = new GetFeedbackHandler(evalRepo);

    await expect(
      handler.execute({ resultId: 'result-1', studentId: 'other-student' })
    ).rejects.toThrow('Access denied');
  });
});

describe('GetConfidenceHandler', () => {
  it('returns confidence breakdown', async () => {
    const result = makePublishedResult();
    const evalRepo = makeEvalRepo({ findResultById: vi.fn().mockResolvedValue(result) });
    const handler = new GetConfidenceHandler(evalRepo);

    const confidence = await handler.execute({ resultId: 'result-1' });

    expect(confidence).not.toBeNull();
    expect(confidence!.confidence).toBe(0.88);
    expect(confidence!.isHigh).toBe(true);
  });
});

describe('SearchEvaluationsHandler', () => {
  it('applies default pagination', async () => {
    const evalRepo = makeEvalRepo({ searchJobs: vi.fn().mockResolvedValue([]) });
    const handler = new SearchEvaluationsHandler(evalRepo);

    await handler.execute({ studentId: 'student-1' });

    expect(evalRepo.searchJobs).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, offset: 0 })
    );
  });
});
