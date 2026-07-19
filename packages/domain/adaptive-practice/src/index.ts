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

// ═══════════════════════════════════════════════════════════════════
// 2. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class PracticeSessionId extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value) throw new Error('PracticeSessionId cannot be empty');
    super({ value });
  }
  get value(): string { return this.props.value; }
}

export class DifficultyLevel extends ValueObject<{ level: string; previousLevel: string | undefined; changeReason: string | undefined }> {
  constructor(level: string, previousLevel?: string | undefined, changeReason?: string | undefined) {
    if (!level) throw new Error('DifficultyLevel level value cannot be empty');
    super({ level, previousLevel, changeReason });
  }
  get level(): string { return this.props.level; }
  get previousLevel(): string | undefined { return this.props.previousLevel; }
  get changeReason(): string | undefined { return this.props.changeReason; }
}

export class SelectionWeight extends ValueObject<{ weight: number }> {
  constructor(weight: number) {
    if (weight < 0) throw new Error('SelectionWeight cannot be negative');
    super({ weight });
  }
  get value(): number { return this.props.weight; }
}

export class MasteryThreshold extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 100) throw new Error('MasteryThreshold must be 0–100');
    super({ value });
  }
  get value(): number { return this.props.value; }
}

export class PracticeDuration extends ValueObject<{ ms: number }> {
  constructor(ms: number) {
    if (ms < 0) throw new Error('PracticeDuration cannot be negative');
    super({ ms });
  }
  get ms(): number { return this.props.ms; }
  get minutes(): number { return Math.floor(this.props.ms / 60000); }
}

export class CoveragePercentage extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 100) throw new Error('CoveragePercentage must be 0–100');
    super({ value });
  }
  get value(): number { return this.props.value; }
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class RecommendationPriority extends ValueObject<{ priority: Priority; weight: number }> {
  constructor(priority: Priority, weight: number) {
    if (weight < 0) throw new Error('RecommendationPriority weight cannot be negative');
    super({ priority, weight });
  }
  get priority(): Priority { return this.props.priority; }
  get weight(): number { return this.props.weight; }
}

export class AdaptiveConfidence extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 1) throw new Error('AdaptiveConfidence must be between 0.0 and 1.0');
    super({ value });
  }
  get value(): number { return this.props.value; }
}

export class SessionMode extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!value) throw new Error('SessionMode value cannot be empty');
    super({ value });
  }
  get value(): string { return this.props.value; }
}

export class PracticeGoal extends ValueObject<{ name: string; targetValue: number }> {
  constructor(name: string, targetValue: number) {
    if (!name) throw new Error('PracticeGoal name cannot be empty');
    super({ name, targetValue });
  }
  get name(): string { return this.props.name; }
  get targetValue(): number { return this.props.targetValue; }
}

// Spaced Repetition Spacing Policy (Rec 11)
export class SpacingPolicy extends ValueObject<{ reviewIntervalHours: number; expansionFactor: number; maxIntervalHours: number }> {
  constructor(reviewIntervalHours: number, expansionFactor: number, maxIntervalHours: number) {
    if (reviewIntervalHours <= 0 || expansionFactor <= 0 || maxIntervalHours <= 0) {
      throw new Error('SpacingPolicy values must be positive');
    }
    super({ reviewIntervalHours, expansionFactor, maxIntervalHours });
  }
  get reviewIntervalHours(): number { return this.props.reviewIntervalHours; }
  get expansionFactor(): number { return this.props.expansionFactor; }
  get maxIntervalHours(): number { return this.props.maxIntervalHours; }
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

  get status(): 'PENDING' | 'COMPLETED' | 'SKIPPED' { return this._status; }
  get accuracy(): number | undefined { return this._accuracy; }
  get timeSpentMs(): number | undefined { return this._timeSpentMs; }

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

  constructor(props: {
    id: string;
    minLevel: string;
    maxLevel: string;
    progressionRate: number;
  }) {
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

  constructor(props: {
    id: string;
    attributeName: string;
    operator: string;
    value: string;
  }) {
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
  public readonly difficultyProfile: { minLevel: string; maxLevel: string; progressionRate: number };
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

  get status(): 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' { return this._status; }
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

  get status(): 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' { return this._status; }

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

  get status(): 'DRAFT' | 'GENERATED' | 'SCHEDULED' | 'DISCARDED' { return this._status; }

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

  get status(): 'DRAFT' | 'GENERATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' { return this._status; }
  get questions(): readonly PracticeQuestion[] { return this._questions; }
  get difficultyProfile(): DifficultyProfile { return this._difficultyProfile; }
  get checkpoint(): SessionCheckpoint | undefined { return this._checkpoint; }
  get feedback(): PracticeFeedback | undefined { return this._feedback; }
  get startedAt(): Date | undefined { return this._startedAt; }
  get endedAt(): Date | undefined { return this._endedAt; }
  get durationMs(): number | undefined { return this._durationMs; }

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
      questionIndex: this._questions.findIndex(q => q.status === 'PENDING'),
      completedCount: this._questions.filter(q => q.status === 'COMPLETED').length,
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
    const answered = this._questions.filter(q => q.status === 'COMPLETED');
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
    if (this._questions.some(q => q.questionVersionId === question.questionVersionId)) {
      throw new Error('Question version already exists in session queue');
    }
    this._questions.push(question);
    this.addDomainEvent(new QuestionSelected(this.id, question.questionVersionId, question.orderIndex));
  }

  public recordResponse(questionVersionId: string, accuracy: number, timeSpentMs: number): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only record responses on Active sessions');
    const q = this._questions.find(item => item.questionVersionId === questionVersionId);
    if (!q) throw new Error('Question not found in session queue');
    q.complete(accuracy, timeSpentMs);
  }

  public recordSkip(questionVersionId: string): void {
    if (this._status !== 'ACTIVE') throw new Error('Can only skip questions on Active sessions');
    const q = this._questions.find(item => item.questionVersionId === questionVersionId);
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
