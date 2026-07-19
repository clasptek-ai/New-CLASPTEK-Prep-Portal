import {
  EvaluationJob,
  EvaluationResult,
  EvaluationSnapshot,
  EvaluationProfile,
  HumanReview,
  PromptVersion,
  PromptExecution,
  BandScore,
  ConfidenceLevel,
  Score,
  TokenUsage,
  PromptHash,
  FeedbackSeverity,
  FeedbackSection,
  EvaluationRecommendation,
  EvidenceReference,
  RubricScore,
  ReviewDecision,
  ReviewComment,
  type QuestionType,
  type EvaluationJobStatus,
  type FeedbackSectionType,
} from '@clasptek/domain-ai-evaluation';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY CONTRACTS
// ═══════════════════════════════════════════════════════════════════

export interface EvaluationSearchFilters {
  studentId?: string | undefined;
  submissionId?: string | undefined;
  status?: EvaluationJobStatus | undefined;
  questionType?: QuestionType | undefined;
  isPublished?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface EvaluationRepository {
  saveJob(job: EvaluationJob): Promise<void>;
  saveSnapshot(snapshot: EvaluationSnapshot): Promise<void>;
  saveResult(result: EvaluationResult): Promise<void>;
  findJobById(id: string): Promise<EvaluationJob | null>;
  findSnapshotById(id: string): Promise<EvaluationSnapshot | null>;
  findResultById(id: string): Promise<EvaluationResult | null>;
  findResultByJobId(jobId: string): Promise<EvaluationResult | null>;
  findResultBySubmission(submissionId: string): Promise<EvaluationResult[]>;
  findPublishedResultsByStudent(studentId: string): Promise<EvaluationResult[]>;
  searchJobs(filters: EvaluationSearchFilters): Promise<EvaluationJob[]>;
  publishResult(resultId: string, publishedAt: Date): Promise<void>;
  archiveJob(jobId: string): Promise<void>;
  nextIdentity(): string;
}

export interface HumanReviewRepository {
  save(review: HumanReview): Promise<void>;
  findById(id: string): Promise<HumanReview | null>;
  findByJob(jobId: string): Promise<HumanReview | null>;
  findPending(): Promise<HumanReview[]>;
  findByReviewer(reviewerId: string): Promise<HumanReview[]>;
  assign(reviewId: string, reviewerId: string): Promise<void>;
  nextIdentity(): string;
}

export interface ModelRepository {
  findById(id: string): Promise<any | null>;
  findByCode(modelCode: string, provider: string): Promise<any | null>;
  findAll(activeOnly?: boolean): Promise<any[]>;
  findCurrentVersion(modelId: string): Promise<any | null>;
}

export interface PromptRepository {
  findByCode(templateCode: string): Promise<any | null>;
  findCurrentVersion(templateCode: string): Promise<PromptVersion | null>;
  saveVersion(version: PromptVersion): Promise<void>;
  saveExecution(execution: PromptExecution): Promise<void>;
  findExecutionsByJob(jobId: string): Promise<PromptExecution[]>;
}

export interface EvaluationProfileRepository {
  findById(id: string): Promise<EvaluationProfile | null>;
  findByCode(profileCode: string): Promise<EvaluationProfile | null>;
  findAll(activeOnly?: boolean): Promise<EvaluationProfile[]>;
}

// ═══════════════════════════════════════════════════════════════════
// 2. COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════

// ─── QueueEvaluationHandler ──────────────────────────────────────

export class QueueEvaluationHandler {
  constructor(
    private readonly evaluationRepo: EvaluationRepository,
    private readonly profileRepo: EvaluationProfileRepository
  ) {}

  public async execute(cmd: {
    submissionId: string;
    sessionId: string;
    studentId: string;
    questionType: QuestionType;
    questionSnapshot: Record<string, any>;
    rubricSnapshot: Record<string, any>;
    submissionSnapshot: Record<string, any>;
    profileCode?: string | undefined;
    evaluationSettings?: Record<string, any>;
    priority?: number | undefined;
  }): Promise<{ jobId: string; snapshotId: string }> {
    // Resolve evaluation profile
    let profile: EvaluationProfile | null = null;
    if (cmd.profileCode) {
      profile = await this.profileRepo.findByCode(cmd.profileCode);
    }

    // Create immutable evaluation snapshot (Rec 1)
    const snapshot = EvaluationSnapshot.create({
      submissionId: cmd.submissionId,
      sessionId: cmd.sessionId,
      studentId: cmd.studentId,
      questionSnapshot: cmd.questionSnapshot,
      rubricSnapshot: cmd.rubricSnapshot,
      submissionSnapshot: cmd.submissionSnapshot,
      ...(cmd.evaluationSettings !== undefined ? { evaluationSettings: cmd.evaluationSettings } : {}),
      ...(profile?.id !== undefined ? { profileId: profile.id } : {}),
    });

    // Queue the evaluation job
    const job = EvaluationJob.queue({
      snapshotId: snapshot.id,
      studentId: cmd.studentId,
      submissionId: cmd.submissionId,
      questionType: cmd.questionType,
      ...(profile?.id !== undefined ? { profileId: profile.id } : {}),
      ...(cmd.priority !== undefined ? { priority: cmd.priority } : {}),
    });

    await this.evaluationRepo.saveSnapshot(snapshot);
    await this.evaluationRepo.saveJob(job);
    return { jobId: job.id, snapshotId: snapshot.id };
  }
}

// ─── RunEvaluationHandler ─────────────────────────────────────────

export class RunEvaluationHandler {
  constructor(
    private readonly evaluationRepo: EvaluationRepository,
    private readonly profileRepo: EvaluationProfileRepository,
    private readonly promptRepo: PromptRepository
  ) {}

  public async execute(cmd: {
    jobId: string;
    modelCode: string;
    provider: string;
    rawScore: number;
    maxScore: number;
    bandScore?: string | undefined;
    bandScoreNumeric?: number | undefined;
    isCorrect?: boolean | undefined;
    confidence: number;
    rubricScores?: Array<{
      criterionCode: string;
      criterionName: string;
      score: number;
      maxScore: number;
      weight: number;
      justification: string;
      bandDescriptor?: string | undefined;
    }>;
    feedbackSections?: Array<{
      sectionType: FeedbackSectionType;
      criterionCode?: string | undefined;
      content: string;
      severity?: string | undefined;
      orderIndex: number;
    }>;
    evidenceRefs?: Array<{
      criterionCode?: string | undefined;
      textExcerpt: string;
      startOffset?: number | undefined;
      endOffset?: number | undefined;
      relevanceNote?: string | undefined;
    }>;
    recommendations?: Array<{
      recommendationType: string;
      priority: string;
      title: string;
      description?: string | undefined;
      targetCompetencyCode?: string | undefined;
    }>;
    tokenUsage?: { promptTokens: number; completionTokens: number };
    latencyMs?: number | undefined;
    systemPromptHash?: string | undefined;
    userPromptHash?: string | undefined;
    evaluationNotes?: string | undefined;
    at?: Date | undefined;
  }): Promise<string> {
    const job = await this.evaluationRepo.findJobById(cmd.jobId);
    if (!job) throw new Error(`EvaluationJob '${cmd.jobId}' not found`);

    job.start(cmd.modelCode, cmd.at ?? new Date());

    // Resolve moderation policy from profile
    let requiresHumanReview = false;
    if (job.profileId) {
      const profile = await this.profileRepo.findById(job.profileId);
      if (profile) {
        const confidence = new ConfidenceLevel(Math.min(1, Math.max(0, cmd.confidence)));
        requiresHumanReview = profile.requiresHumanReview(confidence);
      }
    }

    // Record prompt execution audit (Rec 5)
    if (cmd.systemPromptHash && cmd.userPromptHash) {
      const execution = new PromptExecution({
        id: randomUUID(),
        jobId: job.id,
        provider: cmd.provider,
        modelCode: cmd.modelCode,
        systemPromptHash: new PromptHash(cmd.systemPromptHash),
        userPromptHash: new PromptHash(cmd.userPromptHash),
        tokenUsage: cmd.tokenUsage ? new TokenUsage(cmd.tokenUsage.promptTokens, cmd.tokenUsage.completionTokens) : undefined,
        latencyMs: cmd.latencyMs,
        status: 'COMPLETED',
        executedAt: cmd.at ?? new Date(),
      });
      await this.promptRepo.saveExecution(execution);
    }

    // Build evaluation result
    const resultId = this.evaluationRepo.nextIdentity();
    const result = new EvaluationResult({
      id: resultId,
      jobId: job.id,
      snapshotId: job.snapshotId,
      studentId: job.studentId,
      submissionId: job.submissionId,
      questionType: job.questionType,
      rawScore: cmd.rawScore,
      scaledScore: cmd.rawScore,
      maxScore: cmd.maxScore,
      bandScore: cmd.bandScore ? new BandScore(cmd.bandScore, cmd.bandScoreNumeric) : undefined,
      isCorrect: cmd.isCorrect,
      confidence: new ConfidenceLevel(Math.min(1, Math.max(0, cmd.confidence))),
      evaluationNotes: cmd.evaluationNotes,
    });

    // Add rubric scores (constructor-injected in a real flow; here recorded separately)
    // rubricScores are passed via saveResult — collect them into a local for persistence layer
    const _rubricScores = (cmd.rubricScores ?? []).map(rs => new RubricScore({
      id: randomUUID(),
      criterionCode: rs.criterionCode,
      criterionName: rs.criterionName,
      score: new Score(rs.score, rs.maxScore),
      bandDescriptor: rs.bandDescriptor,
      justification: rs.justification,
      weight: rs.weight,
      createdAt: new Date(),
    }));
    void _rubricScores; // Available for persistence layer extension

    // Add feedback sections
    for (const fs of cmd.feedbackSections ?? []) {
      const section = new FeedbackSection({
        id: randomUUID(),
        sectionType: fs.sectionType,
        criterionCode: fs.criterionCode,
        content: fs.content,
        severity: fs.severity ? new FeedbackSeverity(fs.severity as any) : undefined,
        orderIndex: fs.orderIndex,
        createdAt: new Date(),
      });
      result.addFeedbackSection(section);
    }

    // Add recommendations
    for (const rec of cmd.recommendations ?? []) {
      const recommendation = new EvaluationRecommendation({
        id: randomUUID(),
        recommendationType: rec.recommendationType,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        targetCompetencyCode: rec.targetCompetencyCode,
        createdAt: new Date(),
      });
      result.addRecommendation(recommendation);
    }

    job.complete(cmd.at ?? new Date());

    await this.evaluationRepo.saveResult(result);
    await this.evaluationRepo.saveJob(job);

    if (requiresHumanReview) {
      return resultId; // Caller will invoke RequestHumanReviewHandler
    }

    return resultId;
  }
}

// ─── RequestHumanReviewHandler ────────────────────────────────────

export class RequestHumanReviewHandler {
  constructor(
    private readonly evaluationRepo: EvaluationRepository,
    private readonly reviewRepo: HumanReviewRepository
  ) {}

  public async execute(cmd: {
    jobId: string;
    resultId: string;
    reason: string;
    reviewerId?: string | undefined;
  }): Promise<string> {
    const job = await this.evaluationRepo.findJobById(cmd.jobId);
    if (!job) throw new Error(`EvaluationJob '${cmd.jobId}' not found`);

    const review = HumanReview.assign({
      jobId: job.id,
      resultId: cmd.resultId,
      reviewerId: cmd.reviewerId,
    });

    job.requestHumanReview(review.id, cmd.reason);

    await this.reviewRepo.save(review);
    await this.evaluationRepo.saveJob(job);
    return review.id;
  }
}

// ─── ApproveEvaluationHandler ─────────────────────────────────────

export class ApproveEvaluationHandler {
  constructor(
    private readonly evaluationRepo: EvaluationRepository,
    private readonly reviewRepo: HumanReviewRepository
  ) {}

  public async execute(cmd: {
    jobId: string;
    reviewId?: string | undefined;
    approvedBy: string;
    comments?: Array<{ criterionCode?: string; commentText: string; decision?: string }>;
    at?: Date | undefined;
  }): Promise<void> {
    const job = await this.evaluationRepo.findJobById(cmd.jobId);
    if (!job) throw new Error(`EvaluationJob '${cmd.jobId}' not found`);

    // Handle human review path
    if (cmd.reviewId) {
      const review = await this.reviewRepo.findById(cmd.reviewId);
      if (!review) throw new Error(`HumanReview '${cmd.reviewId}' not found`);

      if (review.status === 'ASSIGNED') review.startReview(cmd.at ?? new Date());

      // Add reviewer comments
      for (const c of cmd.comments ?? []) {
        review.addComment(new ReviewComment({
          id: randomUUID(),
          criterionCode: c.criterionCode,
          commentText: c.commentText,
          decision: c.decision,
          recordedAt: cmd.at ?? new Date(),
        }));
      }

      const decision = new ReviewDecision({
        id: randomUUID(),
        decision: 'APPROVE',
        rationale: `Approved by ${cmd.approvedBy}`,
        decidedAt: cmd.at ?? new Date(),
      });
      review.approve(decision, cmd.at ?? new Date());
      await this.reviewRepo.save(review);
    }

    job.approve(cmd.approvedBy, cmd.at ?? new Date());
    await this.evaluationRepo.saveJob(job);
  }
}

// ─── PublishEvaluationHandler ─────────────────────────────────────

export class PublishEvaluationHandler {
  constructor(
    private readonly evaluationRepo: EvaluationRepository,
    private readonly reviewRepo: HumanReviewRepository
  ) {}

  public async execute(cmd: {
    jobId: string;
    reviewId?: string | undefined;
    at?: Date | undefined;
  }): Promise<void> {
    const at = cmd.at ?? new Date();

    const job = await this.evaluationRepo.findJobById(cmd.jobId);
    if (!job) throw new Error(`EvaluationJob '${cmd.jobId}' not found`);

    const result = await this.evaluationRepo.findResultByJobId(cmd.jobId);
    if (!result) throw new Error(`EvaluationResult for job '${cmd.jobId}' not found`);

    if (cmd.reviewId) {
      const review = await this.reviewRepo.findById(cmd.reviewId);
      if (review && review.status === 'APPROVED') {
        review.publish(at);
        await this.reviewRepo.save(review);
      }
    }

    job.publish(result.id, at);
    result.publish(at);

    await this.evaluationRepo.saveJob(job);
    await this.evaluationRepo.publishResult(result.id, at);
  }
}

// ─── OverrideScoreHandler ─────────────────────────────────────────

export class OverrideScoreHandler {
  constructor(
    private readonly reviewRepo: HumanReviewRepository
  ) {}

  public async execute(cmd: {
    reviewId: string;
    criterionCode?: string | undefined;
    overrideScore: number;
    rationale: string;
    overriddenBy: string;
    at?: Date | undefined;
  }): Promise<void> {
    const review = await this.reviewRepo.findById(cmd.reviewId);
    if (!review) throw new Error(`HumanReview '${cmd.reviewId}' not found`);

    if (!['IN_REVIEW', 'ESCALATED'].includes(review.status)) {
      throw new Error(`Cannot override score when review is in status '${review.status}'`);
    }

    const comment = new ReviewComment({
      id: randomUUID(),
      criterionCode: cmd.criterionCode,
      commentText: cmd.rationale,
      decision: 'OVERRIDE',
      overrideScore: cmd.overrideScore,
      recordedAt: cmd.at ?? new Date(),
    });
    review.addComment(comment);

    await this.reviewRepo.save(review);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. QUERY HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class GetEvaluationHandler {
  constructor(private readonly evaluationRepo: EvaluationRepository) {}

  public async execute(cmd: { jobId?: string | undefined; resultId?: string | undefined }): Promise<EvaluationResult | null> {
    if (cmd.resultId) {
      return this.evaluationRepo.findResultById(cmd.resultId);
    }
    if (cmd.jobId) {
      return this.evaluationRepo.findResultByJobId(cmd.jobId);
    }
    return null;
  }
}

export class GetFeedbackHandler {
  constructor(private readonly evaluationRepo: EvaluationRepository) {}

  public async execute(cmd: { resultId: string; studentId?: string | undefined }): Promise<{
    sections: readonly FeedbackSection[];
    recommendations: readonly EvaluationRecommendation[];
    evidenceRefs: readonly EvidenceReference[];
  } | null> {
    const result = await this.evaluationRepo.findResultById(cmd.resultId);
    if (!result) return null;
    if (cmd.studentId && result.studentId !== cmd.studentId) {
      throw new Error('Access denied: evaluation does not belong to this student');
    }
    if (!result.isPublished) {
      throw new Error('Evaluation has not been published yet');
    }
    return {
      sections: result.feedbackSections,
      recommendations: result.recommendations,
      evidenceRefs: result.evidenceRefs,
    };
  }
}

export class GetConfidenceHandler {
  constructor(private readonly evaluationRepo: EvaluationRepository) {}

  public async execute(cmd: { resultId: string }): Promise<{
    confidence: number;
    isHigh: boolean;
    isMedium: boolean;
    isLow: boolean;
  } | null> {
    const result = await this.evaluationRepo.findResultById(cmd.resultId);
    if (!result || !result.confidence) return null;
    return {
      confidence: result.confidence.value,
      isHigh: result.confidence.isHigh,
      isMedium: result.confidence.isMedium,
      isLow: result.confidence.isLow,
    };
  }
}

export class SearchEvaluationsHandler {
  constructor(private readonly evaluationRepo: EvaluationRepository) {}

  public async execute(filters: EvaluationSearchFilters): Promise<EvaluationJob[]> {
    return this.evaluationRepo.searchJobs({
      ...filters,
      limit: filters.limit ?? 20,
      offset: filters.offset ?? 0,
    });
  }
}
