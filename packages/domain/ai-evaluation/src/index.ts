import { Entity, AggregateRoot, ValueObject } from '@clasptek/kernel';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. DOMAIN EVENT INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════════

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseEvaluationEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {},
    occurredAt: Date = new Date()
  ) {
    this.occurredAt = occurredAt;
  }
}

// ─── Domain Events ───────────────────────────────────────────────

export class EvaluationRequested extends BaseEvaluationEvent {
  constructor(jobId: string, submissionId: string, questionType: string, occurredAt?: Date) {
    super('EvaluationRequested', jobId, { submissionId, questionType }, occurredAt);
  }
}

export class EvaluationStarted extends BaseEvaluationEvent {
  constructor(jobId: string, modelCode: string, occurredAt?: Date) {
    super('EvaluationStarted', jobId, { modelCode }, occurredAt);
  }
}

export class ObjectiveScored extends BaseEvaluationEvent {
  constructor(jobId: string, resultId: string, score: number, isCorrect: boolean, occurredAt?: Date) {
    super('ObjectiveScored', jobId, { resultId, score, isCorrect }, occurredAt);
  }
}

export class EssayScored extends BaseEvaluationEvent {
  constructor(jobId: string, resultId: string, bandScore: string, rawScore: number, occurredAt?: Date) {
    super('EssayScored', jobId, { resultId, bandScore, rawScore }, occurredAt);
  }
}

export class WritingScored extends BaseEvaluationEvent {
  constructor(jobId: string, resultId: string, bandScore: string, rawScore: number, occurredAt?: Date) {
    super('WritingScored', jobId, { resultId, bandScore, rawScore }, occurredAt);
  }
}

export class SpeakingScored extends BaseEvaluationEvent {
  constructor(jobId: string, resultId: string, bandScore: string, rawScore: number, occurredAt?: Date) {
    super('SpeakingScored', jobId, { resultId, bandScore, rawScore }, occurredAt);
  }
}

export class HumanReviewRequested extends BaseEvaluationEvent {
  constructor(jobId: string, reviewId: string, reason: string, occurredAt?: Date) {
    super('HumanReviewRequested', jobId, { reviewId, reason }, occurredAt);
  }
}

export class ReviewCompleted extends BaseEvaluationEvent {
  constructor(reviewId: string, decision: string, occurredAt?: Date) {
    super('ReviewCompleted', reviewId, { decision }, occurredAt);
  }
}

export class EvaluationApproved extends BaseEvaluationEvent {
  constructor(jobId: string, approvedBy: string, occurredAt?: Date) {
    super('EvaluationApproved', jobId, { approvedBy }, occurredAt);
  }
}

export class EvaluationPublished extends BaseEvaluationEvent {
  constructor(jobId: string, resultId: string, studentId: string, occurredAt?: Date) {
    super('EvaluationPublished', jobId, { resultId, studentId }, occurredAt);
  }
}

export class FeedbackGenerated extends BaseEvaluationEvent {
  constructor(resultId: string, sectionCount: number, occurredAt?: Date) {
    super('FeedbackGenerated', resultId, { sectionCount }, occurredAt);
  }
}

export class RecommendationGenerated extends BaseEvaluationEvent {
  constructor(resultId: string, recommendationCount: number, occurredAt?: Date) {
    super('RecommendationGenerated', resultId, { recommendationCount }, occurredAt);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class EvaluationId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value) throw new Error('EvaluationId cannot be empty');
    super({ value });
  }
  get value(): string { return this.props.value; }
}

export class Score extends ValueObject<{ value: number; max: number }> {
  constructor(value: number, max: number) {
    if (value < 0) throw new Error('Score cannot be negative');
    if (max <= 0) throw new Error('Max score must be positive');
    if (value > max) throw new Error('Score cannot exceed max score');
    super({ value, max });
  }
  get value(): number { return this.props.value; }
  get max(): number { return this.props.max; }
  get percentage(): number { return (this.props.value / this.props.max) * 100; }
}

export class BandScore extends ValueObject<{ band: string; numericEquivalent: number | undefined }> {
  constructor(band: string, numericEquivalent?: number) {
    if (!band) throw new Error('BandScore cannot be empty');
    super({ band, numericEquivalent });
  }
  get band(): string { return this.props.band; }
  get numericEquivalent(): number | undefined { return this.props.numericEquivalent; }
}

export class ConfidenceLevel extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 1) throw new Error('ConfidenceLevel must be between 0.0 and 1.0');
    super({ value });
  }
  get value(): number { return this.props.value; }
  get isHigh(): boolean { return this.props.value >= 0.85; }
  get isMedium(): boolean { return this.props.value >= 0.70 && this.props.value < 0.85; }
  get isLow(): boolean { return this.props.value < 0.70; }
}

export class RubricCriterion extends ValueObject<{ code: string; name: string; weight: number }> {
  constructor(code: string, name: string, weight: number) {
    if (!code) throw new Error('RubricCriterion code cannot be empty');
    if (weight < 0 || weight > 1) throw new Error('RubricCriterion weight must be between 0.0 and 1.0');
    super({ code, name, weight });
  }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get weight(): number { return this.props.weight; }
}

export type FeedbackSeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class FeedbackSeverity extends ValueObject<{ level: FeedbackSeverityLevel }> {
  constructor(level: FeedbackSeverityLevel) {
    super({ level });
  }
  get level(): FeedbackSeverityLevel { return this.props.level; }
}

export class GrammarScore extends ValueObject<{ band: string; score: number }> {
  constructor(band: string, score: number) {
    super({ band, score });
  }
  get band(): string { return this.props.band; }
  get score(): number { return this.props.score; }
}

export class VocabularyScore extends ValueObject<{ band: string; score: number }> {
  constructor(band: string, score: number) { super({ band, score }); }
  get band(): string { return this.props.band; }
  get score(): number { return this.props.score; }
}

export class FluencyScore extends ValueObject<{ band: string; score: number }> {
  constructor(band: string, score: number) { super({ band, score }); }
  get band(): string { return this.props.band; }
  get score(): number { return this.props.score; }
}

export class PronunciationScore extends ValueObject<{ band: string; score: number }> {
  constructor(band: string, score: number) { super({ band, score }); }
  get band(): string { return this.props.band; }
  get score(): number { return this.props.score; }
}

export class TaskAchievement extends ValueObject<{ band: string; score: number }> {
  constructor(band: string, score: number) { super({ band, score }); }
  get band(): string { return this.props.band; }
  get score(): number { return this.props.score; }
}

export class CoherenceScore extends ValueObject<{ band: string; score: number }> {
  constructor(band: string, score: number) { super({ band, score }); }
  get band(): string { return this.props.band; }
  get score(): number { return this.props.score; }
}

export class LexicalResource extends ValueObject<{ band: string; score: number }> {
  constructor(band: string, score: number) { super({ band, score }); }
  get band(): string { return this.props.band; }
  get score(): number { return this.props.score; }
}

// Rec 5 — Prompt Audit Value Objects
export class PromptHash extends ValueObject<{ sha256: string }> {
  constructor(sha256: string) {
    if (!sha256) throw new Error('PromptHash cannot be empty');
    super({ sha256 });
  }
  get sha256(): string { return this.props.sha256; }
}

export class TokenUsage extends ValueObject<{ promptTokens: number; completionTokens: number; totalTokens: number }> {
  constructor(promptTokens: number, completionTokens: number) {
    if (promptTokens < 0 || completionTokens < 0) throw new Error('TokenUsage counts cannot be negative');
    super({ promptTokens, completionTokens, totalTokens: promptTokens + completionTokens });
  }
  get promptTokens(): number { return this.props.promptTokens; }
  get completionTokens(): number { return this.props.completionTokens; }
  get totalTokens(): number { return this.props.totalTokens; }
}

// Rec 3 — Calibration Value Objects
export class CalibrationError extends ValueObject<{ value: number }> {
  constructor(value: number) {
    super({ value });
  }
  get value(): number { return this.props.value; }
  get isAcceptable(): boolean { return Math.abs(this.props.value) <= 0.5; }
}

export type DriftIndicator = 'STABLE' | 'DRIFTING_UP' | 'DRIFTING_DOWN' | 'VOLATILE';

export class ReviewerAgreementRate extends ValueObject<{ rate: number }> {
  constructor(rate: number) {
    if (rate < 0 || rate > 1) throw new Error('ReviewerAgreementRate must be between 0.0 and 1.0');
    super({ rate });
  }
  get rate(): number { return this.props.rate; }
  get isGood(): boolean { return this.props.rate >= 0.80; }
}

// ═══════════════════════════════════════════════════════════════════
// 3. ENTITIES
// ═══════════════════════════════════════════════════════════════════

export class ObjectiveScore extends Entity<string> {
  public readonly questionVersionId: string;
  public readonly isCorrect: boolean;
  public readonly selectedAnswer: string | undefined;
  public readonly expectedAnswer: string;
  public readonly score: Score;
  public readonly scoredAt: Date;

  constructor(props: {
    id: string;
    questionVersionId: string;
    isCorrect: boolean;
    selectedAnswer: string | undefined;
    expectedAnswer: string;
    score: Score;
    scoredAt: Date;
  }) {
    super(props.id);
    this.questionVersionId = props.questionVersionId;
    this.isCorrect = props.isCorrect;
    this.selectedAnswer = props.selectedAnswer;
    this.expectedAnswer = props.expectedAnswer;
    this.score = props.score;
    this.scoredAt = props.scoredAt;
  }
}

export class EssayEvaluation extends Entity<string> {
  public readonly overallBand: BandScore;
  public readonly taskAchievement: TaskAchievement;
  public readonly coherence: CoherenceScore;
  public readonly lexical: LexicalResource;
  public readonly grammar: GrammarScore;
  public readonly wordCount: number;
  public readonly evaluatedAt: Date;

  constructor(props: {
    id: string;
    overallBand: BandScore;
    taskAchievement: TaskAchievement;
    coherence: CoherenceScore;
    lexical: LexicalResource;
    grammar: GrammarScore;
    wordCount: number;
    evaluatedAt: Date;
  }) {
    super(props.id);
    this.overallBand = props.overallBand;
    this.taskAchievement = props.taskAchievement;
    this.coherence = props.coherence;
    this.lexical = props.lexical;
    this.grammar = props.grammar;
    this.wordCount = props.wordCount;
    this.evaluatedAt = props.evaluatedAt;
  }
}

export class WritingEvaluation extends Entity<string> {
  public readonly task: string;
  public readonly overallBand: BandScore;
  public readonly taskAchievement: TaskAchievement;
  public readonly coherence: CoherenceScore;
  public readonly lexical: LexicalResource;
  public readonly grammar: GrammarScore;
  public readonly evaluatedAt: Date;

  constructor(props: {
    id: string;
    task: string;
    overallBand: BandScore;
    taskAchievement: TaskAchievement;
    coherence: CoherenceScore;
    lexical: LexicalResource;
    grammar: GrammarScore;
    evaluatedAt: Date;
  }) {
    super(props.id);
    this.task = props.task;
    this.overallBand = props.overallBand;
    this.taskAchievement = props.taskAchievement;
    this.coherence = props.coherence;
    this.lexical = props.lexical;
    this.grammar = props.grammar;
    this.evaluatedAt = props.evaluatedAt;
  }
}

export class SpeakingEvaluation extends Entity<string> {
  public readonly part: number;
  public readonly overallBand: BandScore;
  public readonly fluency: FluencyScore;
  public readonly lexical: LexicalResource;
  public readonly grammar: GrammarScore;
  public readonly pronunciation: PronunciationScore;
  public readonly evaluatedAt: Date;

  constructor(props: {
    id: string;
    part: number;
    overallBand: BandScore;
    fluency: FluencyScore;
    lexical: LexicalResource;
    grammar: GrammarScore;
    pronunciation: PronunciationScore;
    evaluatedAt: Date;
  }) {
    super(props.id);
    this.part = props.part;
    this.overallBand = props.overallBand;
    this.fluency = props.fluency;
    this.lexical = props.lexical;
    this.grammar = props.grammar;
    this.pronunciation = props.pronunciation;
    this.evaluatedAt = props.evaluatedAt;
  }
}

export class RubricScore extends Entity<string> {
  public readonly criterionCode: string;
  public readonly criterionName: string;
  public readonly score: Score;
  public readonly bandDescriptor: string | undefined;
  public readonly justification: string;
  public readonly weight: number;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    criterionCode: string;
    criterionName: string;
    score: Score;
    bandDescriptor: string | undefined;
    justification: string;
    weight: number;
    createdAt: Date;
  }) {
    super(props.id);
    this.criterionCode = props.criterionCode;
    this.criterionName = props.criterionName;
    this.score = props.score;
    this.bandDescriptor = props.bandDescriptor;
    this.justification = props.justification;
    this.weight = props.weight;
    this.createdAt = props.createdAt;
  }

  public get weightedScore(): number {
    return this.score.value * this.weight;
  }
}

export type FeedbackSectionType = 'OVERALL' | 'STRENGTHS' | 'IMPROVEMENTS' | 'EXAMPLES' | 'NEXT_STEPS' | 'CRITERION';

export class FeedbackSection extends Entity<string> {
  public readonly sectionType: FeedbackSectionType;
  public readonly criterionCode: string | undefined;
  public readonly content: string;
  public readonly severity: FeedbackSeverity | undefined;
  public readonly orderIndex: number;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    sectionType: FeedbackSectionType;
    criterionCode?: string | undefined;
    content: string;
    severity?: FeedbackSeverity | undefined;
    orderIndex: number;
    createdAt: Date;
  }) {
    super(props.id);
    this.sectionType = props.sectionType;
    this.criterionCode = props.criterionCode;
    this.content = props.content;
    this.severity = props.severity;
    this.orderIndex = props.orderIndex;
    this.createdAt = props.createdAt;
  }
}

export class EvaluationRecommendation extends Entity<string> {
  public readonly recommendationType: string;
  public readonly priority: string;
  public readonly title: string;
  public readonly description: string | undefined;
  public readonly targetCompetencyCode: string | undefined;
  public readonly targetTopicCode: string | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    recommendationType: string;
    priority: string;
    title: string;
    description?: string | undefined;
    targetCompetencyCode?: string | undefined;
    targetTopicCode?: string | undefined;
    createdAt: Date;
  }) {
    super(props.id);
    this.recommendationType = props.recommendationType;
    this.priority = props.priority;
    this.title = props.title;
    this.description = props.description;
    this.targetCompetencyCode = props.targetCompetencyCode;
    this.targetTopicCode = props.targetTopicCode;
    this.createdAt = props.createdAt;
  }
}

export class EvaluationConfidence extends Entity<string> {
  public readonly confidence: ConfidenceLevel;
  public readonly modelAgreementScore: number | undefined;
  public readonly calibrationNotes: string | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    confidence: ConfidenceLevel;
    modelAgreementScore?: number | undefined;
    calibrationNotes?: string | undefined;
    createdAt: Date;
  }) {
    super(props.id);
    this.confidence = props.confidence;
    this.modelAgreementScore = props.modelAgreementScore;
    this.calibrationNotes = props.calibrationNotes;
    this.createdAt = props.createdAt;
  }
}

export class ReviewDecision extends Entity<string> {
  public readonly decision: 'APPROVE' | 'REJECT' | 'OVERRIDE' | 'FLAG';
  public readonly overrideScore: number | undefined;
  public readonly rationale: string | undefined;
  public readonly decidedAt: Date;

  constructor(props: {
    id: string;
    decision: 'APPROVE' | 'REJECT' | 'OVERRIDE' | 'FLAG';
    overrideScore?: number | undefined;
    rationale?: string | undefined;
    decidedAt: Date;
  }) {
    super(props.id);
    this.decision = props.decision;
    this.overrideScore = props.overrideScore;
    this.rationale = props.rationale;
    this.decidedAt = props.decidedAt;
  }
}

export class ReviewComment extends Entity<string> {
  public readonly criterionCode: string | undefined;
  public readonly commentText: string;
  public readonly decision: string | undefined;
  public readonly overrideScore: number | undefined;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    criterionCode?: string | undefined;
    commentText: string;
    decision?: string | undefined;
    overrideScore?: number | undefined;
    recordedAt: Date;
  }) {
    super(props.id);
    this.criterionCode = props.criterionCode;
    this.commentText = props.commentText;
    this.decision = props.decision;
    this.overrideScore = props.overrideScore;
    this.recordedAt = props.recordedAt;
  }
}

export class EvidenceReference extends Entity<string> {
  public readonly criterionCode: string | undefined;
  public readonly textExcerpt: string;
  public readonly startOffset: number | undefined;
  public readonly endOffset: number | undefined;
  public readonly relevanceNote: string | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    criterionCode?: string | undefined;
    textExcerpt: string;
    startOffset?: number | undefined;
    endOffset?: number | undefined;
    relevanceNote?: string | undefined;
    createdAt: Date;
  }) {
    super(props.id);
    this.criterionCode = props.criterionCode;
    this.textExcerpt = props.textExcerpt;
    this.startOffset = props.startOffset;
    this.endOffset = props.endOffset;
    this.relevanceNote = props.relevanceNote;
    this.createdAt = props.createdAt;
  }
}

export class EvaluationMetadata extends Entity<string> {
  public readonly modelCode: string;
  public readonly modelVersion: string;
  public readonly promptHash: PromptHash;
  public readonly temperature: number | undefined;
  public readonly tokenUsage: TokenUsage | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    modelCode: string;
    modelVersion: string;
    promptHash: PromptHash;
    temperature?: number | undefined;
    tokenUsage?: TokenUsage | undefined;
    createdAt: Date;
  }) {
    super(props.id);
    this.modelCode = props.modelCode;
    this.modelVersion = props.modelVersion;
    this.promptHash = props.promptHash;
    this.temperature = props.temperature;
    this.tokenUsage = props.tokenUsage;
    this.createdAt = props.createdAt;
  }
}

export class ModelExecution extends Entity<string> {
  public readonly provider: string;
  public readonly modelCode: string;
  public readonly latencyMs: number;
  public readonly tokenUsage: TokenUsage | undefined;
  public readonly status: 'PENDING' | 'SENT' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  public readonly errorMessage: string | undefined;
  public readonly executedAt: Date;

  constructor(props: {
    id: string;
    provider: string;
    modelCode: string;
    latencyMs: number;
    tokenUsage?: TokenUsage | undefined;
    status: 'PENDING' | 'SENT' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
    errorMessage?: string | undefined;
    executedAt: Date;
  }) {
    super(props.id);
    this.provider = props.provider;
    this.modelCode = props.modelCode;
    this.latencyMs = props.latencyMs;
    this.tokenUsage = props.tokenUsage;
    this.status = props.status;
    this.errorMessage = props.errorMessage;
    this.executedAt = props.executedAt;
  }
}

export class RubricSnapshot extends Entity<string> {
  public readonly rubricReference: Record<string, any>;
  public readonly criteria: RubricCriterion[];
  public readonly snapshotHash: string;
  public readonly snapshotAt: Date;

  constructor(props: {
    id: string;
    rubricReference: Record<string, any>;
    criteria: RubricCriterion[];
    snapshotHash: string;
    snapshotAt: Date;
  }) {
    super(props.id);
    this.rubricReference = Object.freeze({ ...props.rubricReference });
    this.criteria = [...props.criteria];
    this.snapshotHash = props.snapshotHash;
    this.snapshotAt = props.snapshotAt;
  }
}

// Rec 2 — Prompt Management Entities
export class PromptVersion extends Entity<string> {
  public readonly templateId: string;
  public readonly versionNumber: number;
  public readonly systemPrompt: string;
  public readonly userPromptTemplate: string;
  public readonly promptHash: PromptHash;
  public readonly isCurrent: boolean;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    templateId: string;
    versionNumber: number;
    systemPrompt: string;
    userPromptTemplate: string;
    promptHash: PromptHash;
    isCurrent: boolean;
    createdAt: Date;
  }) {
    super(props.id);
    this.templateId = props.templateId;
    this.versionNumber = props.versionNumber;
    this.systemPrompt = props.systemPrompt;
    this.userPromptTemplate = props.userPromptTemplate;
    this.promptHash = props.promptHash;
    this.isCurrent = props.isCurrent;
    this.createdAt = props.createdAt;
  }
}

// Rec 5 — Prompt Execution / Audit
export class PromptExecution extends Entity<string> {
  public readonly jobId: string;
  public readonly promptVersionId: string | undefined;
  public readonly modelVersionId: string | undefined;
  public readonly provider: string;
  public readonly modelCode: string;
  public readonly systemPromptHash: PromptHash;
  public readonly userPromptHash: PromptHash;
  public readonly temperature: number | undefined;
  public readonly tokenUsage: TokenUsage | undefined;
  public readonly latencyMs: number | undefined;
  public readonly status: 'PENDING' | 'SENT' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  public readonly errorMessage: string | undefined;
  public readonly executedAt: Date;

  constructor(props: {
    id: string;
    jobId: string;
    promptVersionId?: string | undefined;
    modelVersionId?: string | undefined;
    provider: string;
    modelCode: string;
    systemPromptHash: PromptHash;
    userPromptHash: PromptHash;
    temperature?: number | undefined;
    tokenUsage?: TokenUsage | undefined;
    latencyMs?: number | undefined;
    status: 'PENDING' | 'SENT' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
    errorMessage?: string | undefined;
    executedAt: Date;
  }) {
    super(props.id);
    this.jobId = props.jobId;
    this.promptVersionId = props.promptVersionId;
    this.modelVersionId = props.modelVersionId;
    this.provider = props.provider;
    this.modelCode = props.modelCode;
    this.systemPromptHash = props.systemPromptHash;
    this.userPromptHash = props.userPromptHash;
    this.temperature = props.temperature;
    this.tokenUsage = props.tokenUsage;
    this.latencyMs = props.latencyMs;
    this.status = props.status;
    this.errorMessage = props.errorMessage;
    this.executedAt = props.executedAt;
  }
}

// Rec 3 — Calibration Result Entity
export class CalibrationResult extends Entity<string> {
  public readonly expectedScore: number | undefined;
  public readonly observedScore: number;
  public readonly calibrationError: CalibrationError | undefined;
  public readonly reviewerAgreementRate: ReviewerAgreementRate | undefined;
  public readonly driftIndicator: DriftIndicator | undefined;
  public readonly calibrationNotes: string | undefined;
  public readonly calibratedAt: Date;

  constructor(props: {
    id: string;
    expectedScore?: number | undefined;
    observedScore: number;
    calibrationError?: CalibrationError | undefined;
    reviewerAgreementRate?: ReviewerAgreementRate | undefined;
    driftIndicator?: DriftIndicator | undefined;
    calibrationNotes?: string | undefined;
    calibratedAt: Date;
  }) {
    super(props.id);
    this.expectedScore = props.expectedScore;
    this.observedScore = props.observedScore;
    this.calibrationError = props.calibrationError;
    this.reviewerAgreementRate = props.reviewerAgreementRate;
    this.driftIndicator = props.driftIndicator;
    this.calibrationNotes = props.calibrationNotes;
    this.calibratedAt = props.calibratedAt;
  }
}

// Rec 7 — Evaluation Metrics Record Entity
export class EvaluationMetricsRecord extends Entity<string> {
  public readonly aiLatencyMs: number | undefined;
  public readonly totalTokens: number | undefined;
  public readonly promptTokens: number | undefined;
  public readonly completionTokens: number | undefined;
  public readonly confidenceScore: number | undefined;
  public readonly rubricCompletionTimeMs: number | undefined;
  public readonly averageCriterionLatencyMs: number | undefined;
  public readonly reviewerOverrideApplied: boolean;
  public readonly modelAgreementScore: number | undefined;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    aiLatencyMs?: number | undefined;
    totalTokens?: number | undefined;
    promptTokens?: number | undefined;
    completionTokens?: number | undefined;
    confidenceScore?: number | undefined;
    rubricCompletionTimeMs?: number | undefined;
    averageCriterionLatencyMs?: number | undefined;
    reviewerOverrideApplied: boolean;
    modelAgreementScore?: number | undefined;
    recordedAt: Date;
  }) {
    super(props.id);
    this.aiLatencyMs = props.aiLatencyMs;
    this.totalTokens = props.totalTokens;
    this.promptTokens = props.promptTokens;
    this.completionTokens = props.completionTokens;
    this.confidenceScore = props.confidenceScore;
    this.rubricCompletionTimeMs = props.rubricCompletionTimeMs;
    this.averageCriterionLatencyMs = props.averageCriterionLatencyMs;
    this.reviewerOverrideApplied = props.reviewerOverrideApplied;
    this.modelAgreementScore = props.modelAgreementScore;
    this.recordedAt = props.recordedAt;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. AI PROVIDER ABSTRACTION
// ═══════════════════════════════════════════════════════════════════

export interface EvaluationPrompt {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProviderResponse {
  content: string;
  tokenUsage: TokenUsage;
  latencyMs: number;
  modelCode: string;
  provider: string;
  rawResponse?: Record<string, any>;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  evaluate(prompt: EvaluationPrompt): Promise<ProviderResponse>;
  isAvailable(): Promise<boolean>;
}

// Mock AI Provider (Rec Q2 — deterministic testing in CI)
export class MockAIProvider implements AIProvider {
  public readonly id = 'mock-provider-v1';
  public readonly name = 'Mock AI Provider';
  public readonly provider = 'MOCK';

  public async evaluate(_prompt: EvaluationPrompt): Promise<ProviderResponse> {
    // Deterministic mock response for CI/test environments
    const mockScore = 7.0;
    const content = JSON.stringify({
      overallBand: mockScore,
      taskAchievement: { band: '7', score: 7.0 },
      coherence: { band: '7', score: 7.0 },
      lexical: { band: '7', score: 7.0 },
      grammar: { band: '7', score: 7.0 },
      feedback: {
        strengths: ['Clear structure and coherent arguments'],
        improvements: ['Expand vocabulary range for higher band'],
        nextSteps: ['Practice complex sentence structures']
      }
    });
    return {
      content,
      tokenUsage: new TokenUsage(150, 200),
      latencyMs: 50,
      modelCode: 'mock-v1',
      provider: 'MOCK',
    };
  }

  public async isAvailable(): Promise<boolean> {
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 5. RUBRIC ENGINE
// ═══════════════════════════════════════════════════════════════════

export class RubricEngine {
  public score(
    criteriaInputs: Array<{ code: string; name: string; rawScore: number; maxScore: number; weight: number; justification: string }>,
    bandDescriptors: Map<string, Map<string, string>> = new Map()
  ): RubricScore[] {
    return criteriaInputs.map(ci => {
      const score = new Score(ci.rawScore, ci.maxScore);
      const descriptorMap = bandDescriptors.get(ci.code);
      const band = score.percentage >= 88 ? '9' :
                   score.percentage >= 77 ? '8' :
                   score.percentage >= 66 ? '7' :
                   score.percentage >= 55 ? '6' :
                   score.percentage >= 44 ? '5' : '4';
      const bandDescriptor = descriptorMap?.get(band);
      return new RubricScore({
        id: randomUUID(),
        criterionCode: ci.code,
        criterionName: ci.name,
        score,
        bandDescriptor,
        justification: ci.justification,
        weight: ci.weight,
        createdAt: new Date(),
      });
    });
  }

  public weight(scores: RubricScore[]): number {
    if (scores.length === 0) return 0;
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = scores.reduce((sum, s) => sum + s.weightedScore, 0);
    return weightedSum / totalWeight;
  }

  public toBandScore(weightedScore: number): BandScore {
    const rounded = Math.round(weightedScore * 2) / 2; // Round to nearest 0.5
    const band = rounded.toFixed(1);
    return new BandScore(band, rounded);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 6. AGGREGATE ROOTS
// ═══════════════════════════════════════════════════════════════════

// ─── Rec 1: EvaluationSnapshot ───────────────────────────────────

export class EvaluationSnapshot extends AggregateRoot<string> {
  public readonly submissionId: string;
  public readonly sessionId: string;
  public readonly studentId: string;
  public readonly questionSnapshot: Record<string, any>;
  public readonly rubricSnapshot: Record<string, any>;
  public readonly submissionSnapshot: Record<string, any>;
  public readonly modelVersionId: string | undefined;
  public readonly promptVersionId: string | undefined;
  public readonly evaluationSettings: Record<string, any>;
  public readonly profileId: string | undefined;
  public readonly snapshottedAt: Date;

  constructor(props: {
    id: string;
    submissionId: string;
    sessionId: string;
    studentId: string;
    questionSnapshot: Record<string, any>;
    rubricSnapshot: Record<string, any>;
    submissionSnapshot: Record<string, any>;
    modelVersionId?: string | undefined;
    promptVersionId?: string | undefined;
    evaluationSettings?: Record<string, any>;
    profileId?: string | undefined;
    snapshottedAt?: Date;
  }) {
    super(props.id);
    this.submissionId = props.submissionId;
    this.sessionId = props.sessionId;
    this.studentId = props.studentId;
    // All snapshot data is frozen — immutable after creation
    this.questionSnapshot = Object.freeze({ ...props.questionSnapshot });
    this.rubricSnapshot = Object.freeze({ ...props.rubricSnapshot });
    this.submissionSnapshot = Object.freeze({ ...props.submissionSnapshot });
    this.modelVersionId = props.modelVersionId;
    this.promptVersionId = props.promptVersionId;
    this.evaluationSettings = Object.freeze({ ...props.evaluationSettings ?? {} });
    this.profileId = props.profileId;
    this.snapshottedAt = props.snapshottedAt ?? new Date();
  }

  public static create(props: {
    submissionId: string;
    sessionId: string;
    studentId: string;
    questionSnapshot: Record<string, any>;
    rubricSnapshot: Record<string, any>;
    submissionSnapshot: Record<string, any>;
    modelVersionId?: string | undefined;
    promptVersionId?: string | undefined;
    evaluationSettings?: Record<string, any>;
    profileId?: string | undefined;
  }): EvaluationSnapshot {
    return new EvaluationSnapshot({ id: randomUUID(), ...props });
  }
}

// ─── Rec 4: EvaluationProfile ────────────────────────────────────

export class EvaluationProfile extends AggregateRoot<string> {
  public readonly profileCode: string;
  public readonly displayName: string;
  public readonly examContext: string | undefined;
  public readonly modelId: string | undefined;
  public readonly rubricReference: Record<string, any> | undefined;
  public readonly confidenceThreshold: number;
  public readonly moderationPolicy: 'AUTO' | 'ALWAYS_HUMAN' | 'THRESHOLD_BASED' | 'SAMPLE_BASED';
  public readonly settings: Record<string, any>;
  public readonly isActive: boolean;

  constructor(props: {
    id: string;
    profileCode: string;
    displayName: string;
    examContext?: string | undefined;
    modelId?: string | undefined;
    rubricReference?: Record<string, any> | undefined;
    confidenceThreshold: number;
    moderationPolicy: 'AUTO' | 'ALWAYS_HUMAN' | 'THRESHOLD_BASED' | 'SAMPLE_BASED';
    settings?: Record<string, any>;
    isActive: boolean;
  }) {
    super(props.id);
    if (props.confidenceThreshold < 0 || props.confidenceThreshold > 1) {
      throw new Error('EvaluationProfile confidenceThreshold must be between 0.0 and 1.0');
    }
    this.profileCode = props.profileCode;
    this.displayName = props.displayName;
    this.examContext = props.examContext;
    this.modelId = props.modelId;
    this.rubricReference = props.rubricReference;
    this.confidenceThreshold = props.confidenceThreshold;
    this.moderationPolicy = props.moderationPolicy;
    this.settings = props.settings ?? {};
    this.isActive = props.isActive;
  }

  public requiresHumanReview(confidence: ConfidenceLevel): boolean {
    switch (this.moderationPolicy) {
      case 'ALWAYS_HUMAN': return true;
      case 'AUTO': return false;
      case 'THRESHOLD_BASED': return confidence.value < this.confidenceThreshold;
      case 'SAMPLE_BASED': return Math.random() < 0.10; // 10% sample rate
    }
  }
}

// ─── EvaluationJob ───────────────────────────────────────────────

export type EvaluationJobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type QuestionType = 'OBJECTIVE' | 'ESSAY' | 'WRITING' | 'SPEAKING' | 'CODING' | 'STRUCTURED';

export class EvaluationJob extends AggregateRoot<string> {
  public readonly snapshotId: string;
  public readonly studentId: string;
  public readonly submissionId: string;
  public readonly questionType: QuestionType;
  private _status: EvaluationJobStatus;
  public readonly priority: number;
  private _attempts: number;
  public readonly maxAttempts: number;
  public readonly profileId: string | undefined;
  public readonly modelVersionId: string | undefined;
  private _errorMessage: string | undefined;
  public readonly queuedAt: Date;
  private _startedAt: Date | undefined;
  private _completedAt: Date | undefined;
  private _publishedAt: Date | undefined;
  public lockVersion: number;

  constructor(props: {
    id: string;
    snapshotId: string;
    studentId: string;
    submissionId: string;
    questionType: QuestionType;
    status: EvaluationJobStatus;
    priority?: number;
    attempts?: number;
    maxAttempts?: number;
    profileId?: string | undefined;
    modelVersionId?: string | undefined;
    errorMessage?: string | undefined;
    queuedAt?: Date;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    publishedAt?: Date | undefined;
    lockVersion?: number;
  }) {
    super(props.id);
    this.snapshotId = props.snapshotId;
    this.studentId = props.studentId;
    this.submissionId = props.submissionId;
    this.questionType = props.questionType;
    this._status = props.status;
    this.priority = props.priority ?? 5;
    this._attempts = props.attempts ?? 0;
    this.maxAttempts = props.maxAttempts ?? 3;
    this.profileId = props.profileId;
    this.modelVersionId = props.modelVersionId;
    this._errorMessage = props.errorMessage;
    this.queuedAt = props.queuedAt ?? new Date();
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._publishedAt = props.publishedAt;
    this.lockVersion = props.lockVersion ?? 0;
  }

  get status(): EvaluationJobStatus { return this._status; }
  get attempts(): number { return this._attempts; }
  get errorMessage(): string | undefined { return this._errorMessage; }
  get startedAt(): Date | undefined { return this._startedAt; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get publishedAt(): Date | undefined { return this._publishedAt; }

  public static queue(props: {
    snapshotId: string;
    studentId: string;
    submissionId: string;
    questionType: QuestionType;
    profileId?: string | undefined;
    modelVersionId?: string | undefined;
    priority?: number;
  }): EvaluationJob {
    const id = randomUUID();
    const job = new EvaluationJob({ id, ...props, status: 'QUEUED' });
    job.addDomainEvent(new EvaluationRequested(id, props.submissionId, props.questionType));
    return job;
  }

  public start(modelCode: string, at: Date = new Date()): void {
    if (this._status !== 'QUEUED' && this._status !== 'FAILED') {
      throw new Error(`Cannot start evaluation job in status '${this._status}'`);
    }
    if (this._attempts >= this.maxAttempts) {
      throw new Error(`EvaluationJob has exceeded max attempts (${this.maxAttempts})`);
    }
    this._status = 'RUNNING';
    this._startedAt = at;
    this._attempts += 1;
    this.addDomainEvent(new EvaluationStarted(this.id, modelCode, at));
  }

  public complete(at: Date = new Date()): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot complete evaluation job in status '${this._status}'`);
    }
    this._status = 'COMPLETED';
    this._completedAt = at;
  }

  public fail(errorMessage: string): void {
    if (this._status !== 'RUNNING') {
      throw new Error(`Cannot fail evaluation job in status '${this._status}'`);
    }
    this._status = 'FAILED';
    this._errorMessage = errorMessage;
  }

  public requestHumanReview(reviewId: string, reason: string): void {
    if (this._status !== 'COMPLETED') {
      throw new Error(`Cannot request human review for evaluation job in status '${this._status}'`);
    }
    this._status = 'HUMAN_REVIEW_REQUIRED';
    this.addDomainEvent(new HumanReviewRequested(this.id, reviewId, reason));
  }

  public approve(approvedBy: string, at: Date = new Date()): void {
    if (this._status !== 'COMPLETED' && this._status !== 'HUMAN_REVIEW_REQUIRED') {
      throw new Error(`Cannot approve evaluation job in status '${this._status}'`);
    }
    this._status = 'APPROVED';
    this.addDomainEvent(new EvaluationApproved(this.id, approvedBy, at));
  }

  public publish(resultId: string, at: Date = new Date()): void {
    if (this._status !== 'APPROVED') {
      throw new Error(`Cannot publish evaluation job in status '${this._status}'`);
    }
    this._status = 'PUBLISHED';
    this._publishedAt = at;
    this.addDomainEvent(new EvaluationPublished(this.id, resultId, this.studentId, at));
  }

  public archive(): void {
    if (this._status === 'ARCHIVED') return;
    this._status = 'ARCHIVED';
  }

  public get canRetry(): boolean {
    return this._status === 'FAILED' && this._attempts < this.maxAttempts;
  }
}

// ─── EvaluationResult ────────────────────────────────────────────

export class EvaluationResult extends AggregateRoot<string> {
  public readonly jobId: string;
  public readonly snapshotId: string;
  public readonly studentId: string;
  public readonly submissionId: string;
  public readonly questionType: QuestionType;
  public readonly rawScore: number | undefined;
  public readonly scaledScore: number | undefined;
  public readonly bandScore: BandScore | undefined;
  public readonly maxScore: number | undefined;
  public readonly isCorrect: boolean | undefined;
  public readonly confidence: ConfidenceLevel | undefined;
  public readonly evaluationNotes: string | undefined;
  private _rubricScores: RubricScore[];
  private _feedbackSections: FeedbackSection[];
  private _evidenceRefs: EvidenceReference[];
  private _recommendations: EvaluationRecommendation[];
  private _isPublished: boolean;
  private _isArchived: boolean;
  public lockVersion: number;
  public readonly createdAt: Date;
  private _publishedAt: Date | undefined;

  constructor(props: {
    id: string;
    jobId: string;
    snapshotId: string;
    studentId: string;
    submissionId: string;
    questionType: QuestionType;
    rawScore?: number | undefined;
    scaledScore?: number | undefined;
    bandScore?: BandScore | undefined;
    maxScore?: number | undefined;
    isCorrect?: boolean | undefined;
    confidence?: ConfidenceLevel | undefined;
    evaluationNotes?: string | undefined;
    rubricScores?: RubricScore[];
    feedbackSections?: FeedbackSection[];
    evidenceRefs?: EvidenceReference[];
    recommendations?: EvaluationRecommendation[];
    isPublished?: boolean;
    isArchived?: boolean;
    lockVersion?: number;
    createdAt?: Date;
    publishedAt?: Date | undefined;
  }) {
    super(props.id);
    this.jobId = props.jobId;
    this.snapshotId = props.snapshotId;
    this.studentId = props.studentId;
    this.submissionId = props.submissionId;
    this.questionType = props.questionType;
    this.rawScore = props.rawScore;
    this.scaledScore = props.scaledScore;
    this.bandScore = props.bandScore;
    this.maxScore = props.maxScore;
    this.isCorrect = props.isCorrect;
    this.confidence = props.confidence;
    this.evaluationNotes = props.evaluationNotes;
    this._rubricScores = props.rubricScores ?? [];
    this._feedbackSections = (props.feedbackSections ?? []).sort((a, b) => a.orderIndex - b.orderIndex);
    this._evidenceRefs = props.evidenceRefs ?? [];
    this._recommendations = props.recommendations ?? [];
    this._isPublished = props.isPublished ?? false;
    this._isArchived = props.isArchived ?? false;
    this.lockVersion = props.lockVersion ?? 0;
    this.createdAt = props.createdAt ?? new Date();
    this._publishedAt = props.publishedAt;
  }

  get rubricScores(): readonly RubricScore[] { return this._rubricScores; }
  get feedbackSections(): readonly FeedbackSection[] { return this._feedbackSections; }
  get evidenceRefs(): readonly EvidenceReference[] { return this._evidenceRefs; }
  get recommendations(): readonly EvaluationRecommendation[] { return this._recommendations; }
  get isPublished(): boolean { return this._isPublished; }
  get isArchived(): boolean { return this._isArchived; }
  get publishedAt(): Date | undefined { return this._publishedAt; }

  public addFeedbackSection(section: FeedbackSection): void {
    if (this._isPublished) throw new Error('Cannot modify a published EvaluationResult');
    this._feedbackSections.push(section);
    this._feedbackSections.sort((a, b) => a.orderIndex - b.orderIndex);
    this.addDomainEvent(new FeedbackGenerated(this.id, this._feedbackSections.length));
  }

  public addRecommendation(rec: EvaluationRecommendation): void {
    if (this._isPublished) throw new Error('Cannot modify a published EvaluationResult');
    this._recommendations.push(rec);
    this.addDomainEvent(new RecommendationGenerated(this.id, this._recommendations.length));
  }

  public publish(at: Date = new Date()): void {
    if (this._isPublished) throw new Error('EvaluationResult is already published');
    this._isPublished = true;
    this._publishedAt = at;
  }

  public archive(): void {
    this._isArchived = true;
  }

  public get scorePercentage(): number | undefined {
    if (this.rawScore === undefined || this.maxScore === undefined || this.maxScore === 0) return undefined;
    return (this.rawScore / this.maxScore) * 100;
  }
}

// ─── HumanReview (Rec 6 — Expanded 6-State Lifecycle) ───────────

export type HumanReviewStatus = 'ASSIGNED' | 'IN_REVIEW' | 'ESCALATED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';

export class HumanReview extends AggregateRoot<string> {
  public readonly jobId: string;
  public readonly resultId: string | undefined;
  public readonly reviewerId: string | undefined;
  private _status: HumanReviewStatus;
  private _comments: ReviewComment[];
  private _decisions: ReviewDecision[];
  private _escalationReason: string | undefined;
  public readonly assignedAt: Date;
  private _reviewStartedAt: Date | undefined;
  private _reviewCompletedAt: Date | undefined;
  private _publishedAt: Date | undefined;
  public lockVersion: number;

  constructor(props: {
    id: string;
    jobId: string;
    resultId?: string | undefined;
    reviewerId?: string | undefined;
    status: HumanReviewStatus;
    comments?: ReviewComment[];
    decisions?: ReviewDecision[];
    escalationReason?: string | undefined;
    assignedAt?: Date;
    reviewStartedAt?: Date | undefined;
    reviewCompletedAt?: Date | undefined;
    publishedAt?: Date | undefined;
    lockVersion?: number;
  }) {
    super(props.id);
    this.jobId = props.jobId;
    this.resultId = props.resultId;
    this.reviewerId = props.reviewerId;
    this._status = props.status;
    this._comments = props.comments ?? [];
    this._decisions = props.decisions ?? [];
    this._escalationReason = props.escalationReason;
    this.assignedAt = props.assignedAt ?? new Date();
    this._reviewStartedAt = props.reviewStartedAt;
    this._reviewCompletedAt = props.reviewCompletedAt;
    this._publishedAt = props.publishedAt;
    this.lockVersion = props.lockVersion ?? 0;
  }

  get status(): HumanReviewStatus { return this._status; }
  get comments(): readonly ReviewComment[] { return this._comments; }
  get decisions(): readonly ReviewDecision[] { return this._decisions; }
  get escalationReason(): string | undefined { return this._escalationReason; }
  get reviewStartedAt(): Date | undefined { return this._reviewStartedAt; }
  get reviewCompletedAt(): Date | undefined { return this._reviewCompletedAt; }
  get publishedAt(): Date | undefined { return this._publishedAt; }

  public static assign(props: { jobId: string; resultId?: string | undefined; reviewerId?: string | undefined }): HumanReview {
    return new HumanReview({ id: randomUUID(), ...props, status: 'ASSIGNED' });
  }

  public startReview(at: Date = new Date()): void {
    if (this._status !== 'ASSIGNED') {
      throw new Error(`Cannot start review in status '${this._status}'`);
    }
    this._status = 'IN_REVIEW';
    this._reviewStartedAt = at;
  }

  public escalate(reason: string): void {
    if (this._status !== 'IN_REVIEW') {
      throw new Error(`Cannot escalate review in status '${this._status}'`);
    }
    this._status = 'ESCALATED';
    this._escalationReason = reason;
  }

  public addComment(comment: ReviewComment): void {
    if (!['IN_REVIEW', 'ESCALATED'].includes(this._status)) {
      throw new Error(`Cannot add comments in status '${this._status}'`);
    }
    this._comments.push(comment);
  }

  public approve(decision: ReviewDecision, at: Date = new Date()): void {
    if (!['IN_REVIEW', 'ESCALATED'].includes(this._status)) {
      throw new Error(`Cannot approve review in status '${this._status}'`);
    }
    this._status = 'APPROVED';
    this._decisions.push(decision);
    this._reviewCompletedAt = at;
    this.addDomainEvent(new ReviewCompleted(this.id, 'APPROVED', at));
  }

  public reject(decision: ReviewDecision, at: Date = new Date()): void {
    if (!['IN_REVIEW', 'ESCALATED'].includes(this._status)) {
      throw new Error(`Cannot reject review in status '${this._status}'`);
    }
    this._status = 'REJECTED';
    this._decisions.push(decision);
    this._reviewCompletedAt = at;
    this.addDomainEvent(new ReviewCompleted(this.id, 'REJECTED', at));
  }

  public publish(at: Date = new Date()): void {
    if (this._status !== 'APPROVED') {
      throw new Error(`Cannot publish review in status '${this._status}'`);
    }
    this._status = 'PUBLISHED';
    this._publishedAt = at;
  }
}
