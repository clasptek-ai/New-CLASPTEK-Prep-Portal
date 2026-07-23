import { AggregateRoot, Entity, ValueObject } from '@clasptek/kernel';
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

export abstract class BaseAdaptiveEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

// Emitted events list (Rec 15)
export class PracticeSessionCreated extends BaseAdaptiveEvent {
  constructor(sessionId: string, studentId: string, planId: string) {
    super('PracticeSessionCreated', sessionId, { studentId, planId });
  }
}

export class PracticeStarted extends BaseAdaptiveEvent {
  constructor(sessionId: string) {
    super('PracticeStarted', sessionId);
  }
}

export class PracticePaused extends BaseAdaptiveEvent {
  constructor(sessionId: string) {
    super('PracticePaused', sessionId);
  }
}

export class PracticeCompleted extends BaseAdaptiveEvent {
  constructor(sessionId: string, accuracy: number, durationMs: number) {
    super('PracticeCompleted', sessionId, { accuracy, durationMs });
  }
}

export class PracticeArchived extends BaseAdaptiveEvent {
  constructor(sessionId: string) {
    super('PracticeArchived', sessionId);
  }
}

export class PracticeGenerated extends BaseAdaptiveEvent {
  constructor(planId: string, studentId: string) {
    super('PracticeGenerated', planId, { studentId });
  }
}

export class PracticeRegenerated extends BaseAdaptiveEvent {
  constructor(planId: string, oldPlanId: string) {
    super('PracticeRegenerated', planId, { oldPlanId });
  }
}

export class PracticeExpired extends BaseAdaptiveEvent {
  constructor(planId: string) {
    super('PracticeExpired', planId);
  }
}

export class RecommendationGenerated extends BaseAdaptiveEvent {
  constructor(recommendationId: string, studentId: string) {
    super('RecommendationGenerated', recommendationId, { studentId });
  }
}

export class RecommendationAccepted extends BaseAdaptiveEvent {
  constructor(recommendationId: string, planId: string) {
    super('RecommendationAccepted', recommendationId, { planId });
  }
}

export class RecommendationRejected extends BaseAdaptiveEvent {
  constructor(recommendationId: string) {
    super('RecommendationRejected', recommendationId);
  }
}

export class RecommendationViewed extends BaseAdaptiveEvent {
  constructor(recommendationId: string) {
    super('RecommendationViewed', recommendationId);
  }
}

export class RecommendationIgnored extends BaseAdaptiveEvent {
  constructor(recommendationId: string) {
    super('RecommendationIgnored', recommendationId);
  }
}

export class AdaptiveSnapshotUpdated extends BaseAdaptiveEvent {
  constructor(studentId: string, snapshotId: string) {
    super('AdaptiveSnapshotUpdated', studentId, { snapshotId });
  }
}

export class QuestionSelected extends BaseAdaptiveEvent {
  constructor(sessionId: string, questionVersionId: string, orderIndex: number) {
    super('QuestionSelected', sessionId, { questionVersionId, orderIndex });
  }
}

export class QuestionSkipped extends BaseAdaptiveEvent {
  constructor(sessionId: string, questionVersionId: string) {
    super('QuestionSkipped', sessionId, { questionVersionId });
  }
}

export class DifficultyAdjusted extends BaseAdaptiveEvent {
  constructor(sessionId: string, previousLevel: string, currentLevel: string, confidence: number) {
    super('DifficultyAdjusted', sessionId, { previousLevel, currentLevel, confidence });
  }
}

// ───────────────────────────────────────────────────────────────────
// Sprint 2.6 Addendum Domain Events
// ───────────────────────────────────────────────────────────────────

export class PracticeGoalSet extends BaseAdaptiveEvent {
  constructor(goalId: string, studentId: string, goalType: string) {
    super('PracticeGoalSet', goalId, { studentId, goalType });
  }
}

export class RetentionUpdated extends BaseAdaptiveEvent {
  constructor(profileId: string, studentId: string, retentionScore: number, nextReviewDate: Date) {
    super('RetentionUpdated', profileId, { studentId, retentionScore, nextReviewDate });
  }
}

export class ConfidenceRecorded extends BaseAdaptiveEvent {
  constructor(sessionId: string, questionVersionId: string, confidenceLevel: string) {
    super('ConfidenceRecorded', sessionId, { questionVersionId, confidenceLevel });
  }
}

export class DailyGoalCompleted extends BaseAdaptiveEvent {
  constructor(goalId: string, studentId: string, date: string) {
    super('DailyGoalCompleted', goalId, { studentId, date });
  }
}

export class MotivationUpdated extends BaseAdaptiveEvent {
  constructor(studentId: string, xpGained: number, streak: number) {
    super('MotivationUpdated', studentId, { xpGained, streak });
  }
}

export class FocusAreaRecommended extends BaseAdaptiveEvent {
  constructor(studentId: string, recommendedCategory: string) {
    super('FocusAreaRecommended', studentId, { recommendedCategory });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class PracticeSessionId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value) throw new Error('PracticeSessionId cannot be empty');
    super({ value });
  }
  get value(): string {
    return this.props.value;
  }
}

export class DifficultyLevel extends ValueObject<{
  level: string;
  previousLevel: string | undefined;
  changeReason: string | undefined;
}> {
  constructor(
    level: string,
    previousLevel?: string | undefined,
    changeReason?: string | undefined
  ) {
    if (!level) throw new Error('DifficultyLevel level value cannot be empty');
    super({ level, previousLevel, changeReason });
  }
  get level(): string {
    return this.props.level;
  }
  get previousLevel(): string | undefined {
    return this.props.previousLevel;
  }
  get changeReason(): string | undefined {
    return this.props.changeReason;
  }
}

export class SelectionWeight extends ValueObject<{ weight: number }> {
  constructor(weight: number) {
    if (weight < 0) throw new Error('SelectionWeight cannot be negative');
    super({ weight });
  }
  get value(): number {
    return this.props.weight;
  }
}

export class MasteryThreshold extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 100) throw new Error('MasteryThreshold must be 0–100');
    super({ value });
  }
  get value(): number {
    return this.props.value;
  }
}

export class PracticeDuration extends ValueObject<{ ms: number }> {
  constructor(ms: number) {
    if (ms < 0) throw new Error('PracticeDuration cannot be negative');
    super({ ms });
  }
  get ms(): number {
    return this.props.ms;
  }
  get minutes(): number {
    return Math.floor(this.props.ms / 60000);
  }
}

export class CoveragePercentage extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 100) throw new Error('CoveragePercentage must be 0–100');
    super({ value });
  }
  get value(): number {
    return this.props.value;
  }
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class RecommendationPriority extends ValueObject<{ priority: Priority; weight: number }> {
  constructor(priority: Priority, weight: number) {
    if (weight < 0) throw new Error('RecommendationPriority weight cannot be negative');
    super({ priority, weight });
  }
  get priority(): Priority {
    return this.props.priority;
  }
  get weight(): number {
    return this.props.weight;
  }
}

export class AdaptiveConfidence extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 1) throw new Error('AdaptiveConfidence must be between 0.0 and 1.0');
    super({ value });
  }
  get value(): number {
    return this.props.value;
  }
}

export class SessionMode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value) throw new Error('SessionMode value cannot be empty');
    super({ value });
  }
  get value(): string {
    return this.props.value;
  }
}

export class PracticeGoal extends ValueObject<{ name: string; targetValue: number }> {
  constructor(name: string, targetValue: number) {
    if (!name) throw new Error('PracticeGoal name cannot be empty');
    super({ name, targetValue });
  }
  get name(): string {
    return this.props.name;
  }
  get targetValue(): number {
    return this.props.targetValue;
  }
}

// Spaced Repetition Spacing Policy (Rec 11)
export class SpacingPolicy extends ValueObject<{
  reviewIntervalHours: number;
  expansionFactor: number;
  maxIntervalHours: number;
}> {
  constructor(reviewIntervalHours: number, expansionFactor: number, maxIntervalHours: number) {
    if (reviewIntervalHours <= 0 || expansionFactor <= 0 || maxIntervalHours <= 0) {
      throw new Error('SpacingPolicy values must be positive');
    }
    super({ reviewIntervalHours, expansionFactor, maxIntervalHours });
  }
  get reviewIntervalHours(): number {
    return this.props.reviewIntervalHours;
  }
  get expansionFactor(): number {
    return this.props.expansionFactor;
  }
  get maxIntervalHours(): number {
    return this.props.maxIntervalHours;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. ENTITIES
// ═══════════════════════════════════════════════════════════════════

export class PracticeQuestion extends Entity<string> {
  public readonly questionVersionId: string;
  public readonly orderIndex: number;
  private _status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  private _accuracy: number | undefined;
  private _timeSpentMs: number | undefined;

  constructor(props: {
    id: string;
    questionVersionId: string;
    orderIndex: number;
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
    accuracy: number | undefined;
    timeSpentMs: number | undefined;
  }) {
    super(props.id);
    this.questionVersionId = props.questionVersionId;
    this.orderIndex = props.orderIndex;
    this._status = props.status;
    this._accuracy = props.accuracy;
    this._timeSpentMs = props.timeSpentMs;
  }

  get status(): 'PENDING' | 'COMPLETED' | 'SKIPPED' {
    return this._status;
  }
  get accuracy(): number | undefined {
    return this._accuracy;
  }
  get timeSpentMs(): number | undefined {
    return this._timeSpentMs;
  }

  public complete(accuracy: number, timeSpentMs: number): void {
    if (this._status !== 'PENDING') throw new Error('Question already responded to');
    this._status = 'COMPLETED';
    this._accuracy = accuracy;
    this._timeSpentMs = timeSpentMs;
  }

  public skip(): void {
    if (this._status !== 'PENDING') throw new Error('Question already responded to');
    this._status = 'SKIPPED';
    this._accuracy = 0;
  }
}

export class PracticeConfiguration extends Entity<string> {
  public readonly mode: SessionMode;
  public readonly durationTarget: PracticeDuration;
  public readonly allowedRepeats: boolean;
  public readonly masteryThreshold: MasteryThreshold;

  constructor(props: {
    id: string;
    mode: SessionMode;
    durationTarget: PracticeDuration;
    allowedRepeats: boolean;
    masteryThreshold: MasteryThreshold;
  }) {
    super(props.id);
    this.mode = props.mode;
    this.durationTarget = props.durationTarget;
    this.allowedRepeats = props.allowedRepeats;
    this.masteryThreshold = props.masteryThreshold;
  }
}

export class DifficultyProfile extends Entity<string> {
  public readonly minLevel: string;
  public readonly maxLevel: string;
  public readonly progressionRate: number;

  constructor(props: { id: string; minLevel: string; maxLevel: string; progressionRate: number }) {
    super(props.id);
    this.minLevel = props.minLevel;
    this.maxLevel = props.maxLevel;
    this.progressionRate = props.progressionRate;
  }
}

export class CompetencyCoverage extends Entity<string> {
  public readonly competencyId: string;
  public readonly coverageWeight: SelectionWeight;
  public readonly targetPercentage: CoveragePercentage;

  constructor(props: {
    id: string;
    competencyId: string;
    coverageWeight: SelectionWeight;
    targetPercentage: CoveragePercentage;
  }) {
    super(props.id);
    this.competencyId = props.competencyId;
    this.coverageWeight = props.coverageWeight;
    this.targetPercentage = props.targetPercentage;
  }
}

export class QuestionSelectionRule extends Entity<string> {
  public readonly attributeName: string;
  public readonly operator: string;
  public readonly value: string;

  constructor(props: { id: string; attributeName: string; operator: string; value: string }) {
    super(props.id);
    this.attributeName = props.attributeName;
    this.operator = props.operator;
    this.value = props.value;
  }
}

export class SessionCheckpoint extends Entity<string> {
  public readonly questionIndex: number;
  public readonly completedCount: number;
  public readonly pausedAt: Date;

  constructor(props: {
    id: string;
    questionIndex: number;
    completedCount: number;
    pausedAt: Date;
  }) {
    super(props.id);
    this.questionIndex = props.questionIndex;
    this.completedCount = props.completedCount;
    this.pausedAt = props.pausedAt;
  }
}

export class PracticeFeedback extends Entity<string> {
  public readonly rating: number;
  public readonly difficultyPerception: string;
  public readonly confidence: string;
  public readonly satisfaction: string;
  public readonly usefulness: string;
  public readonly technicalIssue: boolean;
  public readonly recommendationQuality: string;
  public readonly comment: string | undefined;

  constructor(props: {
    id: string;
    rating: number;
    difficultyPerception: string;
    confidence: string;
    satisfaction: string;
    usefulness: string;
    technicalIssue: boolean;
    recommendationQuality: string;
    comment: string | undefined;
  }) {
    super(props.id);
    this.rating = props.rating;
    this.difficultyPerception = props.difficultyPerception;
    this.confidence = props.confidence;
    this.satisfaction = props.satisfaction;
    this.usefulness = props.usefulness;
    this.technicalIssue = props.technicalIssue;
    this.recommendationQuality = props.recommendationQuality;
    this.comment = props.comment;
  }
}

export class AdaptiveSnapshot extends Entity<string> {
  public readonly studentId: string;
  public readonly competencyLevels: Record<string, number>;
  public readonly difficultyProfile: {
    minLevel: string;
    maxLevel: string;
    progressionRate: number;
  };
  public readonly weakAreas: string[];
  public readonly strengths: string[];
  public readonly recommendationScore: number;
  public readonly timestamp: Date;

  constructor(props: {
    id: string;
    studentId: string;
    competencyLevels: Record<string, number>;
    difficultyProfile: { minLevel: string; maxLevel: string; progressionRate: number };
    weakAreas: string[];
    strengths: string[];
    recommendationScore: number;
    timestamp: Date;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.competencyLevels = props.competencyLevels;
    this.difficultyProfile = props.difficultyProfile;
    this.weakAreas = props.weakAreas;
    this.strengths = props.strengths;
    this.recommendationScore = props.recommendationScore;
    this.timestamp = props.timestamp;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. AGGREGATE ROOTS
// ═══════════════════════════════════════════════════════════════════

export class PracticeStrategy extends AggregateRoot<string> {
  public readonly displayCode: string;
  public readonly displayName: string;
  public readonly algorithmVersion: string;
  public readonly configurationSchema: Record<string, any>;
  private _status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';

  constructor(props: {
    id: string;
    displayCode: string;
    displayName: string;
    algorithmVersion: string;
    configurationSchema: Record<string, any>;
    status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  }) {
    super(props.id);
    this.displayCode = props.displayCode;
    this.displayName = props.displayName;
    this.algorithmVersion = props.algorithmVersion;
    this.configurationSchema = props.configurationSchema;
    this._status = props.status;
  }

  get status(): 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' {
    return this._status;
  }
}

export class PracticeRecommendation extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly recommendationRules: Record<string, any>;
  public readonly recommendationSource: string;
  public readonly priority: RecommendationPriority;
  private _status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

  // Auditing fields for AI transparency (Rec 3)
  public readonly inputSnapshot: Record<string, any>;
  public readonly algorithmVersion: string;
  public readonly decisionTrace: Record<string, any>;
  public readonly outputPayload: Record<string, any>;
  public lockVersion: number;

  constructor(props: {
    id: string;
    studentId: string;
    recommendationRules: Record<string, any>;
    recommendationSource: string;
    priority: RecommendationPriority;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    inputSnapshot: Record<string, any>;
    algorithmVersion: string;
    decisionTrace: Record<string, any>;
    outputPayload: Record<string, any>;
    lockVersion?: number | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.recommendationRules = props.recommendationRules;
    this.recommendationSource = props.recommendationSource;
    this.priority = props.priority;
    this._status = props.status;
    this.inputSnapshot = props.inputSnapshot;
    this.algorithmVersion = props.algorithmVersion;
    this.decisionTrace = props.decisionTrace;
    this.outputPayload = props.outputPayload;
    this.lockVersion = props.lockVersion ?? 0;
  }

  get status(): 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' {
    return this._status;
  }

  public accept(planId: string): void {
    if (this._status !== 'PENDING') throw new Error('Recommendation is not pending');
    this._status = 'ACCEPTED';
    this.addDomainEvent(new RecommendationAccepted(this.id, planId));
  }

  public reject(): void {
    if (this._status !== 'PENDING') throw new Error('Recommendation is not pending');
    this._status = 'REJECTED';
    this.addDomainEvent(new RecommendationRejected(this.id));
  }

  public expire(): void {
    if (this._status !== 'PENDING') throw new Error('Recommendation is not pending');
    this._status = 'EXPIRED';
    this.addDomainEvent(new PracticeExpired(this.id));
  }
}

export class PracticePlan extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly recommendationId: string | undefined;
  public readonly title: string | undefined;
  private _status: 'DRAFT' | 'GENERATED' | 'SCHEDULED' | 'DISCARDED';
  public readonly selectionRules: QuestionSelectionRule[];
  public readonly targetedCompetencies: CompetencyCoverage[];
  public readonly spacingPolicy: SpacingPolicy;
  public lockVersion: number;

  constructor(props: {
    id: string;
    studentId: string;
    recommendationId: string | undefined;
    title: string | undefined;
    status: 'DRAFT' | 'GENERATED' | 'SCHEDULED' | 'DISCARDED';
    selectionRules: QuestionSelectionRule[];
    targetedCompetencies: CompetencyCoverage[];
    spacingPolicy: SpacingPolicy;
    lockVersion?: number | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.recommendationId = props.recommendationId;
    this.title = props.title;
    this._status = props.status;
    this.selectionRules = [...props.selectionRules];
    this.targetedCompetencies = [...props.targetedCompetencies];
    this.spacingPolicy = props.spacingPolicy;
    this.lockVersion = props.lockVersion ?? 0;
  }

  get status(): 'DRAFT' | 'GENERATED' | 'SCHEDULED' | 'DISCARDED' {
    return this._status;
  }

  public generate(): void {
    if (this._status !== 'DRAFT') throw new Error('Can only generate from DRAFT');
    this._status = 'GENERATED';
    this.addDomainEvent(new PracticeGenerated(this.id, this.studentId));
  }

  public schedule(): void {
    if (this._status !== 'GENERATED') throw new Error('Can only schedule after generation');
    this._status = 'SCHEDULED';
  }

  public discard(): void {
    this._status = 'DISCARDED';
    this.addDomainEvent(new PracticeExpired(this.id));
  }
}

export class PracticeSession extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly planId: string | undefined;
  private _status: 'DRAFT' | 'GENERATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  private _questions: PracticeQuestion[] = [];
  public readonly configuration: PracticeConfiguration;
  private _difficultyProfile: DifficultyProfile;
  private _checkpoint: SessionCheckpoint | undefined;
  private _feedback: PracticeFeedback | undefined;
  private _startedAt: Date | undefined;
  private _endedAt: Date | undefined;
  private _durationMs: number | undefined;
  public lockVersion: number;

  constructor(props: {
    id: string;
    studentId: string;
    planId: string | undefined;
    status: 'DRAFT' | 'GENERATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    questions?: PracticeQuestion[] | undefined;
    configuration: PracticeConfiguration;
    difficultyProfile: DifficultyProfile;
    checkpoint?: SessionCheckpoint | undefined;
    feedback?: PracticeFeedback | undefined;
    startedAt?: Date | undefined;
    endedAt?: Date | undefined;
    durationMs?: number | undefined;
    lockVersion?: number | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.planId = props.planId;
    this._status = props.status;
    this.configuration = props.configuration;
    this._difficultyProfile = props.difficultyProfile;
    this._checkpoint = props.checkpoint;
    this._feedback = props.feedback;
    this._startedAt = props.startedAt;
    this._endedAt = props.endedAt;
    this._durationMs = props.durationMs;
    this.lockVersion = props.lockVersion ?? 0;
    if (props.questions) this._questions = [...props.questions];
  }

  get status(): 'DRAFT' | 'GENERATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' {
    return this._status;
  }
  get questions(): readonly PracticeQuestion[] {
    return this._questions;
  }
  get difficultyProfile(): DifficultyProfile {
    return this._difficultyProfile;
  }
  get checkpoint(): SessionCheckpoint | undefined {
    return this._checkpoint;
  }
  get feedback(): PracticeFeedback | undefined {
    return this._feedback;
  }
  get startedAt(): Date | undefined {
    return this._startedAt;
  }
  get endedAt(): Date | undefined {
    return this._endedAt;
  }
  get durationMs(): number | undefined {
    return this._durationMs;
  }

  public start(at: Date): void {
    if (this._status !== 'DRAFT' && this._status !== 'GENERATED') {
      throw new Error('Session must be Draft or Generated to start');
    }
    this._status = 'ACTIVE';
    this._startedAt = at;
    this.addDomainEvent(new PracticeStarted(this.id));
  }

  public pause(at: Date): void {
    if (this._status !== 'ACTIVE') throw new Error('Session must be Active to pause');
    this._status = 'PAUSED';
    this._checkpoint = new SessionCheckpoint({
      id: randomUUID(),
      questionIndex: this._questions.findIndex((q) => q.status === 'PENDING'),
      completedCount: this._questions.filter((q) => q.status === 'COMPLETED').length,
      pausedAt: at,
    });
    this.addDomainEvent(new PracticePaused(this.id));
  }

  public resume(): void {
    if (this._status !== 'PAUSED') throw new Error('Session must be Paused to resume');
    this._status = 'ACTIVE';
  }

  public complete(at: Date, feedback?: PracticeFeedback | undefined): void {
    if (this._status !== 'ACTIVE' && this._status !== 'PAUSED') {
      throw new Error('Session must be Active or Paused to complete');
    }
    this._status = 'COMPLETED';
    this._endedAt = at;
    if (feedback) this._feedback = feedback;

    // Calculate accuracy
    const answered = this._questions.filter((q) => q.status === 'COMPLETED');
    const totalCorrect = answered.reduce((acc, q) => acc + (q.accuracy ?? 0), 0);
    const overallAccuracy = answered.length > 0 ? totalCorrect / answered.length : 100;
    const duration = this.startedAt ? at.getTime() - this.startedAt.getTime() : 0;
    this._durationMs = duration;

    this.addDomainEvent(new PracticeCompleted(this.id, overallAccuracy, duration));
  }

  public archive(): void {
    if (this._status !== 'COMPLETED') throw new Error('Session must be Completed to archive');
    this._status = 'ARCHIVED';
    this.addDomainEvent(new PracticeArchived(this.id));
  }

  public addQuestion(question: PracticeQuestion): void {
    if (this._status !== 'DRAFT' && this._status !== 'GENERATED') {
      throw new Error('Can only modify question queue in Draft or Generated states');
    }
    if (this._questions.some((q) => q.questionVersionId === question.questionVersionId)) {
      throw new Error('Question version already exists in session queue');
    }
    this._questions.push(question);
    this.addDomainEvent(
      new QuestionSelected(this.id, question.questionVersionId, question.orderIndex)
    );
  }

  public recordResponse(questionVersionId: string, accuracy: number, timeSpentMs: number): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only record responses on Active sessions');
    const q = this._questions.find((item) => item.questionVersionId === questionVersionId);
    if (!q) throw new Error('Question not found in session queue');
    q.complete(accuracy, timeSpentMs);
  }

  public recordSkip(questionVersionId: string): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only skip questions on Active sessions');
    const q = this._questions.find((item) => item.questionVersionId === questionVersionId);
    if (!q) throw new Error('Question not found in session queue');
    q.skip();
    this.addDomainEvent(new QuestionSkipped(this.id, questionVersionId));
  }

  public adjustDifficulty(previousLevel: string, currentLevel: string, confidence: number): void {
    this._difficultyProfile = new DifficultyProfile({
      id: this._difficultyProfile.id,
      minLevel: currentLevel,
      maxLevel: this._difficultyProfile.maxLevel,
      progressionRate: this._difficultyProfile.progressionRate,
    });
    this.addDomainEvent(new DifficultyAdjusted(this.id, previousLevel, currentLevel, confidence));
  }

  public _pushQuestion(q: PracticeQuestion): void {
    this._questions.push(q);
  }
}

// ═══════════════════════════════════════════════════════════════════
// SPRINT 2.6 ADDENDUM VALUE OBJECTS, AGGREGATES & DOMAIN ENGINES
// ═══════════════════════════════════════════════════════════════════

// ─── Value Objects ────────────────────────────────────────────────

export type ConfidenceLevelType = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERT';

export class ConfidenceLevel extends ValueObject<{ level: ConfidenceLevelType }> {
  constructor(level: ConfidenceLevelType) {
    const valid: ConfidenceLevelType[] = ['LOW', 'MEDIUM', 'HIGH', 'EXPERT'];
    if (!valid.includes(level)) throw new Error(`Invalid ConfidenceLevel: ${level}`);
    super({ level });
  }
  get level(): ConfidenceLevelType {
    return this.props.level;
  }
  get numericScore(): number {
    switch (this.props.level) {
      case 'LOW':
        return 0.25;
      case 'MEDIUM':
        return 0.5;
      case 'HIGH':
        return 0.75;
      case 'EXPERT':
        return 1.0;
    }
  }
}

export class ConfidenceScore extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 1)
      throw new Error(`ConfidenceScore must be between 0.0 and 1.0, got ${value}`);
    super({ value });
  }
  get value(): number {
    return this.props.value;
  }
}

export type FocusAreaCategory =
  | 'Accuracy'
  | 'Speed'
  | 'Vocabulary'
  | 'Grammar'
  | 'Inference'
  | 'Problem Solving'
  | 'Listening Accuracy'
  | 'Essay Structure';

export class FocusArea extends ValueObject<{ category: FocusAreaCategory }> {
  constructor(category: FocusAreaCategory) {
    const valid: FocusAreaCategory[] = [
      'Accuracy',
      'Speed',
      'Vocabulary',
      'Grammar',
      'Inference',
      'Problem Solving',
      'Listening Accuracy',
      'Essay Structure',
    ];
    if (!valid.includes(category)) throw new Error(`Invalid FocusArea category: ${category}`);
    super({ category });
  }
  get category(): FocusAreaCategory {
    return this.props.category;
  }
}

export type SessionTypeKind =
  | 'Adaptive Practice'
  | 'Skill Practice'
  | 'Topic Practice'
  | 'Review Practice'
  | 'Timed Practice'
  | 'Untimed Practice'
  | 'Challenge Mode'
  | 'Weak Skill Practice'
  | 'Daily Practice'
  | 'Exam Booster'
  | 'Revision Mode';

export class PracticeSessionType extends ValueObject<{ type: SessionTypeKind }> {
  constructor(type: SessionTypeKind) {
    const valid: SessionTypeKind[] = [
      'Adaptive Practice',
      'Skill Practice',
      'Topic Practice',
      'Review Practice',
      'Timed Practice',
      'Untimed Practice',
      'Challenge Mode',
      'Weak Skill Practice',
      'Daily Practice',
      'Exam Booster',
      'Revision Mode',
    ];
    if (!valid.includes(type)) throw new Error(`Invalid PracticeSessionType: ${type}`);
    super({ type });
  }
  get type(): SessionTypeKind {
    return this.props.type;
  }
}

// ─── AGGREGATE: StudentPracticeGoal (Enhancement 1) ──────────────

export class StudentPracticeGoal extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly journeyId: string | undefined;
  public readonly goalType: string;
  public readonly goalTitle: string;
  public readonly goalDescription: string | undefined;
  public readonly targetValue: number;
  private _status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    journeyId?: string | undefined;
    goalType: string;
    goalTitle: string;
    goalDescription?: string | undefined;
    targetValue: number;
    status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.journeyId = props.journeyId;
    this.goalType = props.goalType;
    this.goalTitle = props.goalTitle;
    this.goalDescription = props.goalDescription;
    this.targetValue = props.targetValue;
    this._status = props.status ?? 'ACTIVE';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get status(): 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' {
    return this._status;
  }

  public complete(): void {
    this._status = 'COMPLETED';
    this.updatedAt = new Date();
  }

  public pause(): void {
    this._status = 'PAUSED';
    this.updatedAt = new Date();
  }

  public cancel(): void {
    this._status = 'CANCELLED';
    this.updatedAt = new Date();
  }

  public static create(
    id: string,
    studentId: string,
    goalType: string,
    goalTitle: string,
    targetValue: number,
    journeyId?: string
  ): StudentPracticeGoal {
    const goal = new StudentPracticeGoal({
      id,
      studentId,
      journeyId,
      goalType,
      goalTitle,
      targetValue,
    });
    goal.addDomainEvent(new PracticeGoalSet(id, studentId, goalType));
    return goal;
  }
}

// ─── AGGREGATE: RetentionProfile (Enhancement 2) ──────────────────

export class RetentionProfile extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly competencyId: string;
  private _lastReviewed: Date;
  private _retentionScore: number; // 0–100
  private _reviewInterval: number; // Hours
  private _nextReviewDate: Date;
  private _reviewPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: {
    id: string;
    studentId: string;
    competencyId: string;
    lastReviewed?: Date | undefined;
    retentionScore?: number | undefined;
    reviewInterval?: number | undefined;
    nextReviewDate?: Date | undefined;
    reviewPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.competencyId = props.competencyId;
    this._lastReviewed = props.lastReviewed ?? new Date();
    this._retentionScore = props.retentionScore ?? 100;
    this._reviewInterval = props.reviewInterval ?? 24;
    this._nextReviewDate =
      props.nextReviewDate ?? new Date(Date.now() + this._reviewInterval * 3600 * 1000);
    this._reviewPriority = props.reviewPriority ?? 'MEDIUM';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get lastReviewed(): Date {
    return this._lastReviewed;
  }
  get retentionScore(): number {
    return this._retentionScore;
  }
  get reviewInterval(): number {
    return this._reviewInterval;
  }
  get nextReviewDate(): Date {
    return this._nextReviewDate;
  }
  get reviewPriority(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    return this._reviewPriority;
  }

  public recordReview(wasCorrect: boolean): void {
    this._lastReviewed = new Date();
    if (wasCorrect) {
      this._reviewInterval = Math.min(720, Math.round(this._reviewInterval * 1.8));
      this._retentionScore = Math.min(100, Math.round(this._retentionScore + 15));
    } else {
      this._reviewInterval = Math.max(12, Math.round(this._reviewInterval * 0.5));
      this._retentionScore = Math.max(0, Math.round(this._retentionScore - 25));
    }

    this._nextReviewDate = new Date(Date.now() + this._reviewInterval * 3600 * 1000);
    if (this._retentionScore < 40) this._reviewPriority = 'CRITICAL';
    else if (this._retentionScore < 60) this._reviewPriority = 'HIGH';
    else if (this._retentionScore < 80) this._reviewPriority = 'MEDIUM';
    else this._reviewPriority = 'LOW';

    this.updatedAt = new Date();
    this.addDomainEvent(
      new RetentionUpdated(this.id, this.studentId, this._retentionScore, this._nextReviewDate)
    );
  }
}

// ─── AGGREGATE: StudentDailyGoal (Enhancement 7) ─────────────────

export class StudentDailyGoal extends AggregateRoot<string> {
  public readonly studentId: string;
  public readonly targetDate: string; // YYYY-MM-DD
  public readonly targetQuestions: number;
  public readonly targetPassages: number;
  public readonly timedPracticeRequired: boolean;
  public readonly vocabularyReviewRequired: boolean;
  private _completedQuestions: number;
  private _status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

  constructor(props: {
    id: string;
    studentId: string;
    targetDate: string;
    targetQuestions: number;
    targetPassages: number;
    timedPracticeRequired: boolean;
    vocabularyReviewRequired: boolean;
    completedQuestions?: number | undefined;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this.targetDate = props.targetDate;
    this.targetQuestions = props.targetQuestions;
    this.targetPassages = props.targetPassages;
    this.timedPracticeRequired = props.timedPracticeRequired;
    this.vocabularyReviewRequired = props.vocabularyReviewRequired;
    this._completedQuestions = props.completedQuestions ?? 0;
    this._status = props.status ?? 'PENDING';
  }

  get completedQuestions(): number {
    return this._completedQuestions;
  }
  get status(): 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' {
    return this._status;
  }

  public incrementProgress(questionsCount: number): void {
    this._completedQuestions += questionsCount;
    if (this._completedQuestions >= this.targetQuestions) {
      this._status = 'COMPLETED';
      this.addDomainEvent(new DailyGoalCompleted(this.id, this.studentId, this.targetDate));
    } else {
      this._status = 'IN_PROGRESS';
    }
  }
}

// ─── AGGREGATE: StudentMotivation (Enhancement 9) ───────────────

export class StudentMotivation extends AggregateRoot<string> {
  public readonly studentId: string;
  private _dailyStreak: number;
  private _weeklyStreak: number;
  private _longestStreak: number;
  private _practicePoints: number;
  private _xp: number;
  private _badges: string[];
  private _achievements: string[];
  private _milestones: string[];

  constructor(props: {
    id: string;
    studentId: string;
    dailyStreak?: number | undefined;
    weeklyStreak?: number | undefined;
    longestStreak?: number | undefined;
    practicePoints?: number | undefined;
    xp?: number | undefined;
    badges?: string[] | undefined;
    achievements?: string[] | undefined;
    milestones?: string[] | undefined;
  }) {
    super(props.id);
    this.studentId = props.studentId;
    this._dailyStreak = props.dailyStreak ?? 0;
    this._weeklyStreak = props.weeklyStreak ?? 0;
    this._longestStreak = props.longestStreak ?? 0;
    this._practicePoints = props.practicePoints ?? 0;
    this._xp = props.xp ?? 0;
    this._badges = props.badges ? [...props.badges] : [];
    this._achievements = props.achievements ? [...props.achievements] : [];
    this._milestones = props.milestones ? [...props.milestones] : [];
  }

  get dailyStreak(): number {
    return this._dailyStreak;
  }
  get weeklyStreak(): number {
    return this._weeklyStreak;
  }
  get longestStreak(): number {
    return this._longestStreak;
  }
  get practicePoints(): number {
    return this._practicePoints;
  }
  get xp(): number {
    return this._xp;
  }
  get badges(): readonly string[] {
    return this._badges;
  }
  get achievements(): readonly string[] {
    return this._achievements;
  }
  get milestones(): readonly string[] {
    return this._milestones;
  }

  public addActivity(points: number, xpGained: number): void {
    this._practicePoints += points;
    this._xp += xpGained;
    this._dailyStreak += 1;
    if (this._dailyStreak > this._longestStreak) {
      this._longestStreak = this._dailyStreak;
    }
    this.addDomainEvent(new MotivationUpdated(this.studentId, xpGained, this._dailyStreak));
  }

  public awardBadge(badgeName: string): void {
    if (!this._badges.includes(badgeName)) {
      this._badges.push(badgeName);
    }
  }
}

// ─── DOMAIN SERVICE: PracticeGoalEngine (Enhancement 1) ───────────

export class PracticeGoalEngine {
  public static recommendGoal(
    _studentId: string,
    weakArea?: string,
    upcomingMockDate?: Date
  ): { goalType: string; goalTitle: string; targetValue: number } {
    if (upcomingMockDate) {
      return {
        goalType: 'PREPARE_FOR_MOCK',
        goalTitle: 'Prepare for Upcoming Mock Examination',
        targetValue: 80,
      };
    }
    if (weakArea === 'Grammar') {
      return {
        goalType: 'IMPROVE_GRAMMAR_ACCURACY',
        goalTitle: 'Improve Grammar Accuracy to 85%',
        targetValue: 85,
      };
    }
    if (weakArea === 'Vocabulary') {
      return {
        goalType: 'REVIEW_WEAK_VOCABULARY',
        goalTitle: 'Review Weak Vocabulary Flashcards',
        targetValue: 50,
      };
    }
    return {
      goalType: 'MAINTAIN_MASTERED_SKILLS',
      goalTitle: 'Maintain Mastered Skills via Spaced Review',
      targetValue: 90,
    };
  }
}

// ─── DOMAIN SERVICE: KnowledgeRetentionEngine (Enhancement 2) ─────

export class KnowledgeRetentionEngine {
  public calculateDecay(lastReviewed: Date, currentIntervalHours: number): number {
    const elapsedHours = (Date.now() - lastReviewed.getTime()) / (3600 * 1000);
    const decayFactor = Math.exp(-elapsedHours / (currentIntervalHours * 2));
    return Math.max(0, Math.min(100, Math.round(100 * decayFactor)));
  }
}

// ─── DOMAIN SERVICE: AdaptiveDifficultyEngine (Enhancement 3) ────

export interface AdaptiveDifficultyInputs {
  accuracy: number; // 0–100
  responseTimeMs: number;
  hintUsage: number;
  confidence: ConfidenceLevelType;
  currentStreak: number;
  mastery: number; // 0–100
  recentPerformance: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export class AdaptiveDifficultyEngine {
  public calculate(
    inputs: AdaptiveDifficultyInputs
  ): 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Adaptive' {
    if (inputs.accuracy >= 90 && inputs.currentStreak >= 4 && inputs.confidence === 'EXPERT') {
      return 'Expert';
    }
    if (inputs.accuracy >= 75 && inputs.recentPerformance !== 'DECLINING') {
      return 'Hard';
    }
    if (inputs.accuracy < 50 || inputs.hintUsage >= 3) {
      return 'Easy';
    }
    return 'Medium';
  }
}

// ─── DOMAIN SERVICE: TimePerformanceAnalyzer (Enhancement 5) ─────

export interface RawTimeMetric {
  questionId: string;
  skillId: string;
  timeSpentMs: number;
  wordCount?: number;
}

export class TimePerformanceAnalyzer {
  public analyze(metrics: RawTimeMetric[]): {
    averageResponseTimeMs: number;
    readingSpeedWpm: number;
    timePerSkillMs: Record<string, number>;
  } {
    if (!metrics.length) {
      return { averageResponseTimeMs: 0, readingSpeedWpm: 0, timePerSkillMs: {} };
    }

    const totalTimeMs = metrics.reduce((acc, m) => acc + m.timeSpentMs, 0);
    const averageResponseTimeMs = Math.round(totalTimeMs / metrics.length);

    const totalWords = metrics.reduce((acc, m) => acc + (m.wordCount ?? 0), 0);
    const totalMinutes = totalTimeMs / 60000;
    const readingSpeedWpm = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;

    const timePerSkillMs: Record<string, number> = {};
    for (const m of metrics) {
      timePerSkillMs[m.skillId] = (timePerSkillMs[m.skillId] ?? 0) + m.timeSpentMs;
    }

    return { averageResponseTimeMs, readingSpeedWpm, timePerSkillMs };
  }
}

// ─── DOMAIN SERVICE: FocusAreaEngine (Enhancement 6) ─────────────

export class FocusAreaEngine {
  public recommendFocusArea(performance: {
    grammarAccuracy: number;
    readingSpeedWpm: number;
    vocabularyScore: number;
  }): FocusAreaCategory {
    if (performance.grammarAccuracy < 65) return 'Grammar';
    if (performance.readingSpeedWpm < 150) return 'Speed';
    if (performance.vocabularyScore < 70) return 'Vocabulary';
    return 'Accuracy';
  }
}

// ─── DOMAIN SERVICE: AdaptiveDailyGoalEngine (Enhancement 7) ────

export interface DailyGoalInputs {
  targetExamDate?: Date;
  learningPace: 'Accelerated' | 'Standard' | 'Flexible' | 'Intensive' | 'Self-Paced';
  mastery: number;
  missedDays: number;
  readinessScore: number;
}

export class AdaptiveDailyGoalEngine {
  public generateDailyGoal(studentId: string, inputs: DailyGoalInputs): StudentDailyGoal {
    let targetQuestions = 15;
    if (['Accelerated', 'Intensive'].includes(inputs.learningPace)) targetQuestions = 25;
    if (inputs.missedDays > 0) targetQuestions += 5; // Makeup catch-up

    const dateStr = new Date().toISOString().split('T')[0];
    return new StudentDailyGoal({
      id: randomUUID(),
      studentId,
      targetDate: dateStr,
      targetQuestions,
      targetPassages: 2,
      timedPracticeRequired: inputs.readinessScore < 70,
      vocabularyReviewRequired: inputs.mastery < 60,
    });
  }
}

// ─── DOMAIN SERVICE: MotivationEngine (Enhancement 9) ────────────

export class MotivationEngine {
  public calculateReward(
    accuracy: number,
    _timeSpentMs: number,
    streak: number
  ): { xp: number; points: number; badgeUnlocked?: string } {
    let xp = 50;
    if (accuracy >= 80) xp += 30;
    if (streak >= 3) xp += 20;

    const points = Math.round(xp / 2);
    let badgeUnlocked: string | undefined = undefined;
    if (streak === 7) badgeUnlocked = '7-Day Practice Streak';

    return {
      xp,
      points,
      ...(badgeUnlocked ? { badgeUnlocked } : {}),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// CANONICAL PRACTICE DELIVERY DOMAIN EXPORTS (Sprint 3.5.1)
// ═══════════════════════════════════════════════════════════════════
export * from './value-objects/practice-value-objects';
export * from './entities/practice-attempt.entity';
export * from './aggregates/practice-result.aggregate';
export * from './aggregates/practice-bookmark.aggregate';
export * from './aggregates/wrong-answer-queue.aggregate';
export * from './aggregates/practice-review-queue.aggregate';
export * from './aggregates/practice-checkpoint.aggregate';
export * from './services/practice-scoring.service';
export * from './services/practice-recommendation.service';
export * from './services/practice-statistics.service';
export * from './strategies/feedback-strategy';
export * from './state-machine/practice-session.state-machine';
export * from './events/practice-delivery-events';
export * from './repositories/practice-delivery-repositories';
