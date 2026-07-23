import { describe, it, expect } from 'vitest';
import {
  // Value Objects
  Score,
  BandScore,
  ConfidenceLevel,
  PromptHash,
  TokenUsage,
  CalibrationError,
  ReviewerAgreementRate,
  CostEstimate,
  // Entities
  FeedbackSection,
  FeedbackSeverity,
  PromptVersion,
  // Aggregates
  EvaluationJob,
  EvaluationResult,
  HumanReview,
  EvaluationSnapshot,
  EvaluationProfile,
  PromptAggregate,
  // Domain Events
  EvaluationRequested,
  EvaluationStarted,
  EvaluationPublished,
  HumanReviewRequested,
  ReviewCompleted,
  EvaluationJobQueued,
  EvaluationJobFailed,
  EvaluationJobArchived,
  // Human Review helpers
  ReviewDecision,
  // AI Providers
  MockAIProvider,
  // Safety
  DEFAULT_SAFETY_POLICY,
  // Engine
  RubricEngine,
} from './index';

// ═══════════════════════════════════════════════════════════════════
// VALUE OBJECT TESTS
// ═══════════════════════════════════════════════════════════════════

describe('Score', () => {
  it('creates a valid score', () => {
    const s = new Score(7, 9);
    expect(s.value).toBe(7);
    expect(s.max).toBe(9);
    expect(s.percentage).toBeCloseTo(77.78, 1);
  });

  it('throws if score exceeds max', () => {
    expect(() => new Score(10, 9)).toThrow('cannot exceed max score');
  });

  it('throws if score is negative', () => {
    expect(() => new Score(-1, 9)).toThrow('cannot be negative');
  });

  it('throws if max is zero or negative', () => {
    expect(() => new Score(0, 0)).toThrow('must be positive');
  });
});

describe('ConfidenceLevel', () => {
  it('identifies high confidence', () => {
    const c = new ConfidenceLevel(0.9);
    expect(c.isHigh).toBe(true);
    expect(c.isMedium).toBe(false);
    expect(c.isLow).toBe(false);
  });

  it('identifies medium confidence', () => {
    const c = new ConfidenceLevel(0.75);
    expect(c.isMedium).toBe(true);
  });

  it('identifies low confidence', () => {
    const c = new ConfidenceLevel(0.6);
    expect(c.isLow).toBe(true);
  });

  it('throws for out-of-range values', () => {
    expect(() => new ConfidenceLevel(1.5)).toThrow();
    expect(() => new ConfidenceLevel(-0.1)).toThrow();
  });
});

describe('PromptHash (Rec 5)', () => {
  it('creates a prompt hash', () => {
    const h = new PromptHash('abc123sha256');
    expect(h.sha256).toBe('abc123sha256');
  });

  it('throws on empty hash', () => {
    expect(() => new PromptHash('')).toThrow('cannot be empty');
  });
});

describe('TokenUsage (Rec 5)', () => {
  it('calculates total tokens correctly', () => {
    const t = new TokenUsage(100, 200);
    expect(t.promptTokens).toBe(100);
    expect(t.completionTokens).toBe(200);
    expect(t.totalTokens).toBe(300);
  });

  it('throws for negative counts', () => {
    expect(() => new TokenUsage(-1, 100)).toThrow('cannot be negative');
  });
});

describe('CalibrationError (Rec 3)', () => {
  it('flags as acceptable when drift is within threshold', () => {
    const e = new CalibrationError(0.3);
    expect(e.isAcceptable).toBe(true);
  });

  it('flags as not acceptable when drift exceeds threshold', () => {
    const e = new CalibrationError(0.8);
    expect(e.isAcceptable).toBe(false);
  });
});

describe('ReviewerAgreementRate (Rec 3)', () => {
  it('flags as good when rate >= 0.80', () => {
    const r = new ReviewerAgreementRate(0.85);
    expect(r.isGood).toBe(true);
  });

  it('throws for out-of-range values', () => {
    expect(() => new ReviewerAgreementRate(1.5)).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// EVALUATION JOB STATE MACHINE TESTS
// ═══════════════════════════════════════════════════════════════════

describe('EvaluationJob state machine', () => {
  const makeJob = () =>
    EvaluationJob.queue({
      snapshotId: 'snap-1',
      studentId: 'student-1',
      submissionId: 'sub-1',
      questionType: 'ESSAY',
      priority: 5,
    });

  it('creates in QUEUED status and emits EvaluationRequested', () => {
    const job = makeJob();
    expect(job.status).toBe('QUEUED');
    const events = job.domainEvents;
    expect(events[0]).toBeInstanceOf(EvaluationRequested);
  });

  it('transitions QUEUED → RUNNING via start()', () => {
    const job = makeJob();
    job.start('gpt-4o');
    expect(job.status).toBe('RUNNING');
    expect(job.attempts).toBe(1);
    expect(job.domainEvents.some((e) => e instanceof EvaluationStarted)).toBe(true);
  });

  it('transitions RUNNING → COMPLETED via complete()', () => {
    const job = makeJob();
    job.start('gpt-4o');
    job.complete();
    expect(job.status).toBe('COMPLETED');
  });

  it('transitions RUNNING → FAILED via fail()', () => {
    const job = makeJob();
    job.start('gpt-4o');
    job.fail('Provider timeout');
    expect(job.status).toBe('FAILED');
    expect(job.errorMessage).toBe('Provider timeout');
    expect(job.canRetry).toBe(true);
  });

  it('transitions COMPLETED → HUMAN_REVIEW_REQUIRED', () => {
    const job = makeJob();
    job.start('gpt-4o');
    job.complete();
    job.requestHumanReview('review-1', 'Low confidence score');
    expect(job.status).toBe('HUMAN_REVIEW_REQUIRED');
    expect(job.domainEvents.some((e) => e instanceof HumanReviewRequested)).toBe(true);
  });

  it('transitions COMPLETED → APPROVED → PUBLISHED', () => {
    const job = makeJob();
    job.start('gpt-4o');
    job.complete();
    job.approve('admin-1');
    expect(job.status).toBe('APPROVED');
    job.publish('result-1');
    expect(job.status).toBe('PUBLISHED');
    expect(job.publishedAt).toBeDefined();
    expect(job.domainEvents.some((e) => e instanceof EvaluationPublished)).toBe(true);
  });

  it('throws when starting from non-QUEUED status', () => {
    const job = makeJob();
    job.start('gpt-4o');
    expect(() => job.start('gpt-4o')).toThrow();
  });

  it('throws when publishing from non-APPROVED status', () => {
    const job = makeJob();
    job.start('gpt-4o');
    job.complete();
    expect(() => job.publish('result-1')).toThrow('Cannot publish');
  });

  it('blocks publish after exceeding max attempts', () => {
    const job = makeJob();
    job.start('gpt-4o');
    job.fail('Error 1');
    job.start('gpt-4o');
    job.fail('Error 2');
    job.start('gpt-4o');
    job.fail('Error 3');
    expect(job.canRetry).toBe(false);
    expect(() => job.start('gpt-4o')).toThrow('exceeded max attempts');
  });
});

// ═══════════════════════════════════════════════════════════════════
// EVALUATION RESULT IMMUTABILITY TEST
// ═══════════════════════════════════════════════════════════════════

describe('EvaluationResult immutability', () => {
  const makeResult = () =>
    new EvaluationResult({
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
    });

  it('allows adding feedback before publish', () => {
    const result = makeResult();
    const section = new FeedbackSection({
      id: 'sec-1',
      sectionType: 'STRENGTHS',
      content: 'Well-structured argument',
      severity: new FeedbackSeverity('LOW'),
      orderIndex: 1,
      createdAt: new Date(),
    });
    result.addFeedbackSection(section);
    expect(result.feedbackSections).toHaveLength(1);
  });

  it('blocks feedback modification after publish', () => {
    const result = makeResult();
    result.publish();
    const section = new FeedbackSection({
      id: 'sec-2',
      sectionType: 'IMPROVEMENTS',
      content: 'Improve conclusion',
      orderIndex: 2,
      createdAt: new Date(),
    });
    expect(() => result.addFeedbackSection(section)).toThrow('published');
  });

  it('calculates score percentage correctly', () => {
    const result = makeResult();
    expect(result.scorePercentage).toBeCloseTo(77.78, 1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// HUMAN REVIEW LIFECYCLE TESTS (Rec 6 — 6-State Machine)
// ═══════════════════════════════════════════════════════════════════

describe('HumanReview lifecycle (Rec 6)', () => {
  const makeReview = () =>
    HumanReview.assign({ jobId: 'job-1', resultId: 'result-1', reviewerId: 'reviewer-1' });

  it('creates in ASSIGNED status', () => {
    const review = makeReview();
    expect(review.status).toBe('ASSIGNED');
  });

  it('transitions ASSIGNED → IN_REVIEW', () => {
    const review = makeReview();
    review.startReview();
    expect(review.status).toBe('IN_REVIEW');
    expect(review.reviewStartedAt).toBeDefined();
  });

  it('transitions IN_REVIEW → ESCALATED', () => {
    const review = makeReview();
    review.startReview();
    review.escalate('Requires senior reviewer');
    expect(review.status).toBe('ESCALATED');
    expect(review.escalationReason).toBe('Requires senior reviewer');
  });

  it('transitions IN_REVIEW → APPROVED', () => {
    const review = makeReview();
    review.startReview();
    const decision = new ReviewDecision({ id: 'd-1', decision: 'APPROVE', decidedAt: new Date() });
    review.approve(decision);
    expect(review.status).toBe('APPROVED');
    expect(review.domainEvents.some((e) => e instanceof ReviewCompleted)).toBe(true);
  });

  it('transitions IN_REVIEW → REJECTED', () => {
    const review = makeReview();
    review.startReview();
    const decision = new ReviewDecision({
      id: 'd-2',
      decision: 'REJECT',
      rationale: 'Scores too high',
      decidedAt: new Date(),
    });
    review.reject(decision);
    expect(review.status).toBe('REJECTED');
  });

  it('transitions APPROVED → PUBLISHED', () => {
    const review = makeReview();
    review.startReview();
    const decision = new ReviewDecision({ id: 'd-3', decision: 'APPROVE', decidedAt: new Date() });
    review.approve(decision);
    review.publish();
    expect(review.status).toBe('PUBLISHED');
    expect(review.publishedAt).toBeDefined();
  });

  it('throws when escalating from non-IN_REVIEW state', () => {
    const review = makeReview();
    expect(() => review.escalate('error')).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// EVALUATION SNAPSHOT IMMUTABILITY (Rec 1)
// ═══════════════════════════════════════════════════════════════════

describe('EvaluationSnapshot (Rec 1)', () => {
  it('creates and freezes snapshot data', () => {
    const snapshot = EvaluationSnapshot.create({
      submissionId: 'sub-1',
      sessionId: 'session-1',
      studentId: 'student-1',
      questionSnapshot: { questionId: 'q-1', payload: { text: 'Discuss globalisation' } },
      rubricSnapshot: { criteria: ['taskAchievement', 'coherence'] },
      submissionSnapshot: { answers: [{ questionVersionId: 'qv-1', payload: 'My essay...' }] },
    });

    expect(snapshot.submissionId).toBe('sub-1');
    expect(snapshot.snapshottedAt).toBeDefined();
    // Immutability: Object.isFrozen
    expect(Object.isFrozen(snapshot.questionSnapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.rubricSnapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.submissionSnapshot)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// EVALUATION PROFILE (Rec 4)
// ═══════════════════════════════════════════════════════════════════

describe('EvaluationProfile (Rec 4)', () => {
  it('requires human review for ALWAYS_HUMAN policy', () => {
    const profile = new EvaluationProfile({
      id: 'prof-1',
      profileCode: 'IELTS_WRITING',
      displayName: 'IELTS Writing',
      confidenceThreshold: 0.8,
      moderationPolicy: 'ALWAYS_HUMAN',
      isActive: true,
    });
    expect(profile.requiresHumanReview(new ConfidenceLevel(0.99))).toBe(true);
  });

  it('does not require human review for AUTO policy with high confidence', () => {
    const profile = new EvaluationProfile({
      id: 'prof-2',
      profileCode: 'OBJECTIVE',
      displayName: 'Objective',
      confidenceThreshold: 0.99,
      moderationPolicy: 'AUTO',
      isActive: true,
    });
    expect(profile.requiresHumanReview(new ConfidenceLevel(0.99))).toBe(false);
  });

  it('requires human review when confidence is below threshold (THRESHOLD_BASED)', () => {
    const profile = new EvaluationProfile({
      id: 'prof-3',
      profileCode: 'TOEFL_WRITING',
      displayName: 'TOEFL Writing',
      confidenceThreshold: 0.8,
      moderationPolicy: 'THRESHOLD_BASED',
      isActive: true,
    });
    expect(profile.requiresHumanReview(new ConfidenceLevel(0.65))).toBe(true);
    expect(profile.requiresHumanReview(new ConfidenceLevel(0.85))).toBe(false);
  });

  it('throws if confidence threshold is out of range', () => {
    expect(
      () =>
        new EvaluationProfile({
          id: 'prof-bad',
          profileCode: 'BAD',
          displayName: 'Bad',
          confidenceThreshold: 1.5,
          moderationPolicy: 'AUTO',
          isActive: true,
        })
    ).toThrow('between 0.0 and 1.0');
  });
});

// ═══════════════════════════════════════════════════════════════════
// RUBRIC ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════

describe('RubricEngine', () => {
  const engine = new RubricEngine();

  it('scores criteria and assigns band descriptors', () => {
    // 7/9 = 77.78% → engine assigns band '8' (>= 77%)
    const bandDescriptors = new Map([
      [
        'TA',
        new Map([
          ['7', 'Addresses all parts of the task'],
          ['8', 'Covers all requirements fully'],
        ]),
      ],
    ]);
    const scores = engine.score(
      [
        {
          code: 'TA',
          name: 'Task Achievement',
          rawScore: 7,
          maxScore: 9,
          weight: 0.25,
          justification: 'Good task coverage',
        },
      ],
      bandDescriptors
    );
    expect(scores).toHaveLength(1);
    expect(scores[0].criterionCode).toBe('TA');
    expect(scores[0].bandDescriptor).toBe('Covers all requirements fully'); // band 8 descriptor
  });

  it('calculates weighted score across criteria', () => {
    const scores = engine.score([
      {
        code: 'TA',
        name: 'Task Achievement',
        rawScore: 7,
        maxScore: 9,
        weight: 0.25,
        justification: '',
      },
      { code: 'CC', name: 'Coherence', rawScore: 8, maxScore: 9, weight: 0.25, justification: '' },
      {
        code: 'LR',
        name: 'Lexical Resource',
        rawScore: 7,
        maxScore: 9,
        weight: 0.25,
        justification: '',
      },
      { code: 'GR', name: 'Grammar', rawScore: 7, maxScore: 9, weight: 0.25, justification: '' },
    ]);
    const weighted = engine.weight(scores);
    expect(weighted).toBeGreaterThan(6);
    expect(weighted).toBeLessThan(9);
  });

  it('converts weighted score to band score (half-band rounding)', () => {
    const band = engine.toBandScore(7.25);
    expect(band.band).toBe('7.5');
    expect(band.numericEquivalent).toBe(7.5);
  });
});

// ═══════════════════════════════════════════════════════════════════
// MOCK AI PROVIDER TESTS (Enterprise Contract — all methods)
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// CostEstimate VALUE OBJECT TESTS
// ═══════════════════════════════════════════════════════════════════

describe('CostEstimate', () => {
  it('creates a valid cost estimate', () => {
    const cost = new CostEstimate(1000, 500, 0.0125);
    expect(cost.inputTokens).toBe(1000);
    expect(cost.outputTokens).toBe(500);
    expect(cost.totalTokens).toBe(1500);
    expect(cost.costUsd).toBe(0.0125);
    expect(cost.currency).toBe('USD');
  });

  it('throws on negative token counts', () => {
    expect(() => new CostEstimate(-1, 100, 0.01)).toThrow('cannot be negative');
  });

  it('throws on negative cost', () => {
    expect(() => new CostEstimate(100, 100, -0.01)).toThrow('cannot be negative');
  });

  it('allows zero cost (e.g. mock provider)', () => {
    const cost = new CostEstimate(0, 0, 0);
    expect(cost.costUsd).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// MOCK PROVIDER CANONICAL TESTING
// ═══════════════════════════════════════════════════════════════════

describe('MockAIProvider implementation', () => {
  const provider = new MockAIProvider();

  it('evaluates writing using MockAIProvider', async () => {
    const context = {
      provider: 'MOCK',
      model: 'mock-v1',
      prompt: 'Student content payload',
      timeout: 10000,
      temperature: 0.2,
      maxTokens: 1000,
      rubric: {},
      studentId: 'std-1',
      submissionId: 'sub-1',
      jobId: 'job-1',
      retryAttempt: 1,
      evaluationType: 'WRITING' as const,
    };
    const result = await provider.evaluateWriting(context);
    expect(result.rawScore).toBe(7.0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// PROMPT AGGREGATE TESTS (First-Class Business Asset)
// ═══════════════════════════════════════════════════════════════════

describe('PromptAggregate', () => {
  it('creates a prompt aggregate via factory', () => {
    const prompt = PromptAggregate.create({
      templateCode: 'IELTS_ESSAY_EVAL',
      displayName: 'IELTS Essay Evaluation',
      questionTypeTarget: 'ESSAY',
      examContext: 'IELTS_ACADEMIC',
    });
    expect(prompt.templateCode).toBe('IELTS_ESSAY_EVAL');
    expect(prompt.isActive).toBe(true);
    expect(prompt.versions).toHaveLength(0);
    expect(prompt.currentVersion).toBeUndefined();
  });

  it('adds a version and returns it as currentVersion', () => {
    const prompt = PromptAggregate.create({
      templateCode: 'WRITING_EVAL',
      displayName: 'Writing Evaluation',
      questionTypeTarget: 'WRITING',
    });

    const version = new PromptVersion({
      id: 'pv-1',
      templateId: prompt.id,
      versionNumber: 1,
      systemPrompt: 'You are an expert IELTS examiner.',
      userPromptTemplate: 'Evaluate the following essay: {{essay}}',
      promptHash: new PromptHash('sha256-abc123'),
      isCurrent: true,
      createdAt: new Date(),
    });

    prompt.addVersion(version);
    expect(prompt.versions).toHaveLength(1);
    expect(prompt.currentVersion?.versionNumber).toBe(1);
  });

  it('throws when adding a version with mismatched templateId', () => {
    const prompt = PromptAggregate.create({
      templateCode: 'SPEAKING_EVAL',
      displayName: 'Speaking Evaluation',
      questionTypeTarget: 'SPEAKING',
    });

    const mismatchedVersion = new PromptVersion({
      id: 'pv-wrong',
      templateId: 'wrong-template-id',
      versionNumber: 1,
      systemPrompt: 'sys',
      userPromptTemplate: 'user {{essay}}',
      promptHash: new PromptHash('sha256-xyz'),
      isCurrent: true,
      createdAt: new Date(),
    });

    expect(() => prompt.addVersion(mismatchedVersion)).toThrow('does not match aggregate id');
  });
});

// ═══════════════════════════════════════════════════════════════════
// AI SAFETY TYPE TESTS
// ═══════════════════════════════════════════════════════════════════

describe('DEFAULT_SAFETY_POLICY', () => {
  it('enables all safety controls by default', () => {
    expect(DEFAULT_SAFETY_POLICY.enablePromptInjectionDetection).toBe(true);
    expect(DEFAULT_SAFETY_POLICY.enablePiiDetection).toBe(true);
    expect(DEFAULT_SAFETY_POLICY.enableToxicityFilter).toBe(true);
    expect(DEFAULT_SAFETY_POLICY.enableOutputSchemaValidation).toBe(true);
    expect(DEFAULT_SAFETY_POLICY.maxRetries).toBe(3);
    expect(DEFAULT_SAFETY_POLICY.timeoutMs).toBe(30_000);
    expect(DEFAULT_SAFETY_POLICY.fallbackOnViolation).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// NEW DOMAIN EVENT TESTS (EvaluationJobQueued / Failed / Archived)
// ═══════════════════════════════════════════════════════════════════

describe('New domain events', () => {
  it('EvaluationJobQueued carries submissionId and questionType', () => {
    const event = new EvaluationJobQueued('job-1', 'sub-1', 'ESSAY');
    expect(event.eventName).toBe('EvaluationJobQueued');
    expect(event.aggregateId).toBe('job-1');
    expect(event.payload.submissionId).toBe('sub-1');
    expect(event.payload.questionType).toBe('ESSAY');
  });

  it('EvaluationJobFailed carries errorMessage and attempts', () => {
    const event = new EvaluationJobFailed('job-2', 'Timeout after 30s', 3);
    expect(event.eventName).toBe('EvaluationJobFailed');
    expect(event.payload.errorMessage).toBe('Timeout after 30s');
    expect(event.payload.attempts).toBe(3);
  });

  it('EvaluationJobArchived carries only the job id', () => {
    const event = new EvaluationJobArchived('job-3');
    expect(event.eventName).toBe('EvaluationJobArchived');
    expect(event.aggregateId).toBe('job-3');
    expect(Object.keys(event.payload)).toHaveLength(0);
  });
});
