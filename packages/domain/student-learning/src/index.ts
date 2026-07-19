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

export abstract class BaseLearningEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt = new Date();

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

// ───────────────────────────────────────────────────────────────────
// Journey Events
// ───────────────────────────────────────────────────────────────────

export class StudentJourneyCreated extends BaseLearningEvent {
  constructor(journeyId: string, studentId: string) {
    super('StudentJourneyCreated', journeyId, { studentId });
  }
}

export class StudentJourneyActivated extends BaseLearningEvent {
  constructor(journeyId: string) {
    super('StudentJourneyActivated', journeyId);
  }
}

export class StudentJourneyPaused extends BaseLearningEvent {
  constructor(journeyId: string) {
    super('StudentJourneyPaused', journeyId);
  }
}

export class StudentJourneyArchived extends BaseLearningEvent {
  constructor(journeyId: string) {
    super('StudentJourneyArchived', journeyId);
  }
}

// ───────────────────────────────────────────────────────────────────
// Enrollment Events (Rec 1 — Separate Aggregate, Rec 9 — Integration)
// ───────────────────────────────────────────────────────────────────

export class ProgrammeEnrolled extends BaseLearningEvent {
  constructor(enrollmentId: string, studentId: string, programmeId: string) {
    super('ProgrammeEnrolled', enrollmentId, { studentId, programmeId });
  }
}

export class ProgrammeWithdrawn extends BaseLearningEvent {
  constructor(enrollmentId: string, reason: string) {
    super('ProgrammeWithdrawn', enrollmentId, { reason });
  }
}

export class ProgrammeCompleted extends BaseLearningEvent {
  constructor(enrollmentId: string, programmeId: string) {
    super('ProgrammeCompleted', enrollmentId, { programmeId });
  }
}

// ───────────────────────────────────────────────────────────────────
// Goal Events
// ───────────────────────────────────────────────────────────────────

export class GoalCreated extends BaseLearningEvent {
  constructor(journeyId: string, goalId: string, title: string) {
    super('GoalCreated', journeyId, { goalId, title });
  }
}

export class GoalCompleted extends BaseLearningEvent {
  constructor(journeyId: string, goalId: string) {
    super('GoalCompleted', journeyId, { goalId });
  }
}

// ───────────────────────────────────────────────────────────────────
// Study Session Events
// ───────────────────────────────────────────────────────────────────

export class StudySessionStarted extends BaseLearningEvent {
  constructor(journeyId: string, sessionId: string, programmeId?: string) {
    super('StudySessionStarted', journeyId, { sessionId, programmeId });
  }
}

export class StudySessionEnded extends BaseLearningEvent {
  constructor(journeyId: string, sessionId: string, durationMs: number) {
    super('StudySessionEnded', journeyId, { sessionId, durationMs });
  }
}

export class StudyStreakUpdated extends BaseLearningEvent {
  constructor(journeyId: string, currentStreak: number, longestStreak: number) {
    super('StudyStreakUpdated', journeyId, { currentStreak, longestStreak });
  }
}

// ───────────────────────────────────────────────────────────────────
// Progress Events (Rec 9 — Integration events)
// ───────────────────────────────────────────────────────────────────

export class LessonCompleted extends BaseLearningEvent {
  constructor(journeyId: string, lessonId: string) {
    super('LessonCompleted', journeyId, { lessonId });
  }
}

export class ModuleCompleted extends BaseLearningEvent {
  constructor(journeyId: string, moduleId: string) {
    super('ModuleCompleted', journeyId, { moduleId });
  }
}

export class MilestoneCompleted extends BaseLearningEvent {
  constructor(journeyId: string, milestoneId: string) {
    super('MilestoneCompleted', journeyId, { milestoneId });
  }
}

export class CompetencyUpdated extends BaseLearningEvent {
  constructor(journeyId: string, competencyId: string, newScore: number) {
    super('CompetencyUpdated', journeyId, { competencyId, newScore });
  }
}

// ───────────────────────────────────────────────────────────────────
// Achievement & Bookmark Events
// ───────────────────────────────────────────────────────────────────

export class AchievementUnlocked extends BaseLearningEvent {
  constructor(journeyId: string, achievementType: string, definitionId?: string) {
    super('AchievementUnlocked', journeyId, { achievementType, definitionId });
  }
}

export class BookmarkAdded extends BaseLearningEvent {
  constructor(journeyId: string, resourceType: string, resourceId: string) {
    super('BookmarkAdded', journeyId, { resourceType, resourceId });
  }
}

export class BookmarkRemoved extends BaseLearningEvent {
  constructor(journeyId: string, bookmarkId: string) {
    super('BookmarkRemoved', journeyId, { bookmarkId });
  }
}

export class LearningPlanUpdated extends BaseLearningEvent {
  constructor(journeyId: string, planId: string, versionNo: string) {
    super('LearningPlanUpdated', journeyId, { planId, versionNo });
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

export class CompletionPercentage extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error(`CompletionPercentage must be 0–100, received: ${value}`);
    }
    super({ value });
  }
  get value(): number { return this.props.value; }
}

export class MasteryScore extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error(`MasteryScore must be 0–100, received: ${value}`);
    }
    super({ value });
  }
  get value(): number { return this.props.value; }
}

export class StudyDuration extends ValueObject<{ ms: number }> {
  constructor(ms: number) {
    if (ms < 0) throw new Error('StudyDuration cannot be negative');
    super({ ms });
  }
  get ms(): number { return this.props.ms; }
  get minutes(): number { return Math.floor(this.props.ms / 60000); }
  get hours(): number { return Math.floor(this.props.ms / 3600000); }
}

export class StreakCount extends ValueObject<{ current: number; longest: number }> {
  constructor(current: number, longest: number) {
    if (current < 0 || longest < 0) throw new Error('StreakCount cannot be negative');
    super({ current, longest });
  }
  get current(): number { return this.props.current; }
  get longest(): number { return this.props.longest; }
}

export type JourneyStatus = 'CREATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type EnrollmentStatus = 'ACTIVE' | 'WITHDRAWN' | 'SUSPENDED' | 'COMPLETED';
export type GoalStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BookmarkResourceType = 'LESSON' | 'MODULE' | 'QUESTION' | 'RESOURCE' | 'PROGRAMME';
export type BurnoutRisk = 'LOW' | 'MEDIUM' | 'HIGH';
export type LearningPlanSource = 'AI_GENERATED' | 'INSTRUCTOR' | 'STUDENT';

// ═══════════════════════════════════════════════════════════════════
// 3. ENTITIES
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// Achievement Definition (Rec 6 — Catalogue separate from earned)
// ───────────────────────────────────────────────────────────────────

export interface AchievementDefinitionProps {
  id: string;
  code: string;
  name: string;
  description?: string | undefined;
  iconKey?: string | undefined;
  unlockCriteria?: Record<string, any> | undefined;
  achievementType: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export class AchievementDefinition extends Entity<string> {
  public readonly code: string;
  public readonly name: string;
  public readonly description: string | undefined;
  public readonly iconKey: string | undefined;
  public readonly unlockCriteria: Record<string, any> | undefined;
  public readonly achievementType: string;
  public readonly status: 'ACTIVE' | 'INACTIVE';

  constructor(props: AchievementDefinitionProps) {
    super(props.id);
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.iconKey = props.iconKey;
    this.unlockCriteria = props.unlockCriteria;
    this.achievementType = props.achievementType;
    this.status = props.status;
  }
}

// ───────────────────────────────────────────────────────────────────
// Achievement (Earned)
// ───────────────────────────────────────────────────────────────────

export class Achievement extends Entity<string> {
  public readonly achievementType: string;
  public readonly definitionId: string | undefined;
  public readonly unlockedAt: Date;
  public readonly payload: Record<string, any> | undefined;

  constructor(props: {
    id: string;
    achievementType: string;
    definitionId?: string | undefined;
    unlockedAt: Date;
    payload?: Record<string, any> | undefined;
  }) {
    super(props.id);
    this.achievementType = props.achievementType;
    this.definitionId = props.definitionId;
    this.unlockedAt = props.unlockedAt;
    this.payload = props.payload;
  }
}

// ───────────────────────────────────────────────────────────────────
// Bookmark (Generalized — Rec 7)
// ───────────────────────────────────────────────────────────────────

export class Bookmark extends Entity<string> {
  public readonly resourceType: BookmarkResourceType;
  public readonly resourceId: string;
  public readonly notes: string | undefined;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    resourceType: BookmarkResourceType;
    resourceId: string;
    notes?: string | undefined;
    createdAt: Date;
  }) {
    super(props.id);
    this.resourceType = props.resourceType;
    this.resourceId = props.resourceId;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
  }
}

// ───────────────────────────────────────────────────────────────────
// CompetencyProgressHistory (Rec 3)
// ───────────────────────────────────────────────────────────────────

export class CompetencyProgressHistoryEntry extends Entity<string> {
  public readonly previousScore: number | undefined;
  public readonly newScore: number;
  public readonly source: string | undefined;
  public readonly actorId: string | undefined;
  public readonly recordedAt: Date;

  constructor(props: {
    id: string;
    previousScore?: number | undefined;
    newScore: number;
    source?: string | undefined;
    actorId?: string | undefined;
    recordedAt: Date;
  }) {
    super(props.id);
    this.previousScore = props.previousScore;
    this.newScore = props.newScore;
    this.source = props.source;
    this.actorId = props.actorId;
    this.recordedAt = props.recordedAt;
  }
}

export class CompetencyProgress extends Entity<string> {
  public readonly competencyId: string;
  private _masteryScore: MasteryScore;
  private _history: CompetencyProgressHistoryEntry[] = [];
  public readonly lastUpdated: Date;

  constructor(props: {
    id: string;
    competencyId: string;
    masteryScore: number;
    lastUpdated: Date;
    history?: CompetencyProgressHistoryEntry[] | undefined;
  }) {
    super(props.id);
    this.competencyId = props.competencyId;
    this._masteryScore = new MasteryScore(props.masteryScore);
    this.lastUpdated = props.lastUpdated;
    if (props.history) this._history = [...props.history];
  }

  get masteryScore(): number { return this._masteryScore.value; }
  get history(): readonly CompetencyProgressHistoryEntry[] { return this._history; }

  public update(newScore: number, source?: string, actorId?: string): CompetencyProgressHistoryEntry {
    const entry = new CompetencyProgressHistoryEntry({
      id: randomUUID(),
      previousScore: this._masteryScore.value,
      newScore,
      source,
      actorId,
      recordedAt: new Date(),
    });
    this._masteryScore = new MasteryScore(newScore);
    this._history.push(entry);
    return entry;
  }
}

// ───────────────────────────────────────────────────────────────────
// Study Session (Extended — Rec 4)
// ───────────────────────────────────────────────────────────────────

export class StudySession extends Entity<string> {
  public readonly programmeId: string | undefined;
  public readonly startedAt: Date;
  private _endedAt: Date | undefined;
  private _durationMs: number | undefined;
  public readonly deviceType: string | undefined;
  public readonly platform: string | undefined;
  public readonly ipHash: string | undefined;
  public readonly timezone: string | undefined;
  private _interruptionCount: number;
  private _idleTimeMs: number;
  public readonly completionReason: string | undefined;

  constructor(props: {
    id: string;
    programmeId?: string | undefined;
    startedAt: Date;
    endedAt?: Date | undefined;
    durationMs?: number | undefined;
    deviceType?: string | undefined;
    platform?: string | undefined;
    ipHash?: string | undefined;
    timezone?: string | undefined;
    interruptionCount?: number | undefined;
    idleTimeMs?: number | undefined;
    completionReason?: string | undefined;
  }) {
    super(props.id);
    this.programmeId = props.programmeId;
    this.startedAt = props.startedAt;
    this._endedAt = props.endedAt;
    this._durationMs = props.durationMs;
    this.deviceType = props.deviceType;
    this.platform = props.platform;
    this.ipHash = props.ipHash;
    this.timezone = props.timezone;
    this._interruptionCount = props.interruptionCount ?? 0;
    this._idleTimeMs = props.idleTimeMs ?? 0;
    this.completionReason = props.completionReason;
  }

  get endedAt(): Date | undefined { return this._endedAt; }
  get durationMs(): number | undefined { return this._durationMs; }
  get interruptionCount(): number { return this._interruptionCount; }
  get idleTimeMs(): number { return this._idleTimeMs; }
  get isActive(): boolean { return this._endedAt === undefined; }

  public end(endedAt: Date, durationMs: number): void {
    if (!this.isActive) throw new Error('Session already ended');
    this._endedAt = endedAt;
    this._durationMs = durationMs;
  }
}

// ───────────────────────────────────────────────────────────────────
// Lesson & Module Progress
// ───────────────────────────────────────────────────────────────────

export class LessonProgress extends Entity<string> {
  public readonly lessonId: string;
  private _completed: boolean;
  private _completedAt: Date | undefined;
  public readonly durationMs: number | undefined;

  constructor(props: {
    id: string;
    lessonId: string;
    completed: boolean;
    completedAt?: Date | undefined;
    durationMs?: number | undefined;
  }) {
    super(props.id);
    this.lessonId = props.lessonId;
    this._completed = props.completed;
    this._completedAt = props.completedAt;
    this.durationMs = props.durationMs;
  }

  get completed(): boolean { return this._completed; }
  get completedAt(): Date | undefined { return this._completedAt; }

  public markComplete(at: Date): void {
    if (this._completed) throw new Error(`Lesson ${this.lessonId} already completed`);
    this._completed = true;
    this._completedAt = at;
  }
}

export class ModuleProgress extends Entity<string> {
  public readonly moduleId: string;
  private _completionPercentage: CompletionPercentage;
  private _status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  private _startedAt: Date | undefined;
  private _completedAt: Date | undefined;
  private _lessonProgress: LessonProgress[] = [];

  constructor(props: {
    id: string;
    moduleId: string;
    completionPercentage: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    lessonProgress?: LessonProgress[] | undefined;
  }) {
    super(props.id);
    this.moduleId = props.moduleId;
    this._completionPercentage = new CompletionPercentage(props.completionPercentage);
    this._status = props.status;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    if (props.lessonProgress) this._lessonProgress = [...props.lessonProgress];
  }

  get completionPercentage(): number { return this._completionPercentage.value; }
  get status(): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' { return this._status; }
  get startedAt(): Date | undefined { return this._startedAt; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get lessonProgress(): readonly LessonProgress[] { return this._lessonProgress; }
}

// ───────────────────────────────────────────────────────────────────
// Learning Milestone
// ───────────────────────────────────────────────────────────────────

export class LearningMilestone extends Entity<string> {
  public readonly title: string;
  public readonly milestoneType: string;
  private _completed: boolean;
  private _completedAt: Date | undefined;

  constructor(props: {
    id: string;
    title: string;
    milestoneType: string;
    completed: boolean;
    completedAt?: Date | undefined;
  }) {
    super(props.id);
    this.title = props.title;
    this.milestoneType = props.milestoneType;
    this._completed = props.completed;
    this._completedAt = props.completedAt;
  }

  get completed(): boolean { return this._completed; }
  get completedAt(): Date | undefined { return this._completedAt; }

  public markComplete(at: Date): void {
    if (this._completed) throw new Error(`Milestone "${this.title}" already completed`);
    this._completed = true;
    this._completedAt = at;
  }
}

// ───────────────────────────────────────────────────────────────────
// Learning Goal
// ───────────────────────────────────────────────────────────────────

export class LearningGoal extends Entity<string> {
  public readonly programmeId: string | undefined;
  public readonly title: string;
  public readonly description: string | undefined;
  public readonly priority: GoalPriority;
  private _status: GoalStatus;
  public readonly targetDate: Date | undefined;
  private _completedAt: Date | undefined;

  constructor(props: {
    id: string;
    programmeId?: string | undefined;
    title: string;
    description?: string | undefined;
    priority: GoalPriority;
    status: GoalStatus;
    targetDate?: Date | undefined;
    completedAt?: Date | undefined;
  }) {
    super(props.id);
    this.programmeId = props.programmeId;
    this.title = props.title;
    this.description = props.description;
    this.priority = props.priority;
    this._status = props.status;
    this.targetDate = props.targetDate;
    this._completedAt = props.completedAt;
  }

  get status(): GoalStatus { return this._status; }
  get completedAt(): Date | undefined { return this._completedAt; }

  public activate(): void {
    if (this._status !== 'DRAFT') throw new Error('Only DRAFT goals can be activated');
    this._status = 'ACTIVE';
  }

  public complete(at: Date): void {
    if (this._status !== 'ACTIVE') throw new Error('Only ACTIVE goals can be completed');
    this._status = 'COMPLETED';
    this._completedAt = at;
  }

  public cancel(): void {
    if (this._status === 'COMPLETED') throw new Error('Cannot cancel a completed goal');
    this._status = 'CANCELLED';
  }
}

// ───────────────────────────────────────────────────────────────────
// Learning Plan Version (Rec 5)
// ───────────────────────────────────────────────────────────────────

export class LearningPlanVersion extends Entity<string> {
  public readonly versionNo: string;
  public readonly source: LearningPlanSource;
  public readonly goals: Record<string, any> | undefined;
  public readonly schedule: Record<string, any> | undefined;
  public readonly notes: string | undefined;
  public readonly isCurrent: boolean;
  public readonly createdAt: Date;

  constructor(props: {
    id: string;
    versionNo: string;
    source: LearningPlanSource;
    goals?: Record<string, any> | undefined;
    schedule?: Record<string, any> | undefined;
    notes?: string | undefined;
    isCurrent: boolean;
    createdAt: Date;
  }) {
    super(props.id);
    this.versionNo = props.versionNo;
    this.source = props.source;
    this.goals = props.goals;
    this.schedule = props.schedule;
    this.notes = props.notes;
    this.isCurrent = props.isCurrent;
    this.createdAt = props.createdAt;
  }
}

// ───────────────────────────────────────────────────────────────────
// Journey Health (Rec 8 — calculated, persisted model)
// ───────────────────────────────────────────────────────────────────

export class JourneyHealth extends Entity<string> {
  public readonly journeyId: string;
  private _engagementScore: number;
  private _consistencyScore: number;
  private _completionVelocity: number;
  private _inactivityDays: number;
  private _burnoutRisk: BurnoutRisk;
  private _recommendationPriority: number;
  public readonly lastCalculatedAt: Date;

  constructor(props: {
    id: string;
    journeyId: string;
    engagementScore: number;
    consistencyScore: number;
    completionVelocity: number;
    inactivityDays: number;
    burnoutRisk: BurnoutRisk;
    recommendationPriority: number;
    lastCalculatedAt: Date;
  }) {
    super(props.id);
    this.journeyId = props.journeyId;
    this._engagementScore = props.engagementScore;
    this._consistencyScore = props.consistencyScore;
    this._completionVelocity = props.completionVelocity;
    this._inactivityDays = props.inactivityDays;
    this._burnoutRisk = props.burnoutRisk;
    this._recommendationPriority = props.recommendationPriority;
    this.lastCalculatedAt = props.lastCalculatedAt;
  }

  get engagementScore(): number { return this._engagementScore; }
  get consistencyScore(): number { return this._consistencyScore; }
  get completionVelocity(): number { return this._completionVelocity; }
  get inactivityDays(): number { return this._inactivityDays; }
  get burnoutRisk(): BurnoutRisk { return this._burnoutRisk; }
  get recommendationPriority(): number { return this._recommendationPriority; }
}

// ───────────────────────────────────────────────────────────────────
// Student Dashboard Projection (Rec 10 — Read Model)
// ───────────────────────────────────────────────────────────────────

export class StudentDashboardProjection extends Entity<string> {
  public readonly journeyId: string;
  public readonly studentId: string;
  public readonly activeProgrammeId: string | undefined;
  public readonly activeProgrammeName: string | undefined;
  public readonly overallProgress: number;
  public readonly currentGoalId: string | undefined;
  public readonly currentGoalTitle: string | undefined;
  public readonly currentStreak: number;
  public readonly nextMilestoneId: string | undefined;
  public readonly nextMilestoneTitle: string | undefined;
  public readonly recommendationPayload: Record<string, any> | undefined;
  public readonly lastProjectedAt: Date;

  constructor(props: {
    id: string;
    journeyId: string;
    studentId: string;
    activeProgrammeId?: string | undefined;
    activeProgrammeName?: string | undefined;
    overallProgress: number;
    currentGoalId?: string | undefined;
    currentGoalTitle?: string | undefined;
    currentStreak: number;
    nextMilestoneId?: string | undefined;
    nextMilestoneTitle?: string | undefined;
    recommendationPayload?: Record<string, any> | undefined;
    lastProjectedAt: Date;
  }) {
    super(props.id);
    this.journeyId = props.journeyId;
    this.studentId = props.studentId;
    this.activeProgrammeId = props.activeProgrammeId;
    this.activeProgrammeName = props.activeProgrammeName;
    this.overallProgress = props.overallProgress;
    this.currentGoalId = props.currentGoalId;
    this.currentGoalTitle = props.currentGoalTitle;
    this.currentStreak = props.currentStreak;
    this.nextMilestoneId = props.nextMilestoneId;
    this.nextMilestoneTitle = props.nextMilestoneTitle;
    this.recommendationPayload = props.recommendationPayload;
    this.lastProjectedAt = props.lastProjectedAt;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. AGGREGATE ROOTS
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// AGGREGATE: StudentProgrammeEnrollment (Rec 1 — Separate Aggregate)
// ───────────────────────────────────────────────────────────────────

export class StudentProgrammeEnrollment extends AggregateRoot<string> {
  private _journeyId: string;
  private _studentId: string;
  private _programmeId: string;
  private _programmeVersionId: string;
  private _status: EnrollmentStatus;
  private _deliveryMode: string | undefined;
  private _cohortId: string | undefined;
  private _intakeDate: Date | undefined;
  private _paymentVerified: boolean;
  private _instructorId: string | undefined;
  private _completionCertificateId: string | undefined;
  private _withdrawnAt: Date | undefined;
  private _withdrawalReason: string | undefined;
  private _completedAt: Date | undefined;
  private _moduleProgress: ModuleProgress[] = [];
  public lockVersion: number;

  constructor(props: {
    id: string;
    journeyId: string;
    studentId: string;
    programmeId: string;
    programmeVersionId: string;
    status: EnrollmentStatus;
    deliveryMode?: string | undefined;
    cohortId?: string | undefined;
    intakeDate?: Date | undefined;
    paymentVerified?: boolean | undefined;
    instructorId?: string | undefined;
    completionCertificateId?: string | undefined;
    withdrawnAt?: Date | undefined;
    withdrawalReason?: string | undefined;
    completedAt?: Date | undefined;
    lockVersion?: number | undefined;
  }) {
    super(props.id);
    this._journeyId = props.journeyId;
    this._studentId = props.studentId;
    this._programmeId = props.programmeId;
    this._programmeVersionId = props.programmeVersionId;
    this._status = props.status;
    this._deliveryMode = props.deliveryMode;
    this._cohortId = props.cohortId;
    this._intakeDate = props.intakeDate;
    this._paymentVerified = props.paymentVerified ?? false;
    this._instructorId = props.instructorId;
    this._completionCertificateId = props.completionCertificateId;
    this._withdrawnAt = props.withdrawnAt;
    this._withdrawalReason = props.withdrawalReason;
    this._completedAt = props.completedAt;
    this.lockVersion = props.lockVersion ?? 0;
  }

  get journeyId(): string { return this._journeyId; }
  get studentId(): string { return this._studentId; }
  get programmeId(): string { return this._programmeId; }
  get programmeVersionId(): string { return this._programmeVersionId; }
  get status(): EnrollmentStatus { return this._status; }
  get deliveryMode(): string | undefined { return this._deliveryMode; }
  get cohortId(): string | undefined { return this._cohortId; }
  get intakeDate(): Date | undefined { return this._intakeDate; }
  get paymentVerified(): boolean { return this._paymentVerified; }
  get instructorId(): string | undefined { return this._instructorId; }
  get completionCertificateId(): string | undefined { return this._completionCertificateId; }
  get withdrawnAt(): Date | undefined { return this._withdrawnAt; }
  get withdrawalReason(): string | undefined { return this._withdrawalReason; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get moduleProgress(): readonly ModuleProgress[] { return this._moduleProgress; }

  public static create(
    id: string,
    journeyId: string,
    studentId: string,
    programmeId: string,
    programmeVersionId: string,
    options: { deliveryMode?: string | undefined; cohortId?: string | undefined; intakeDate?: Date | undefined } = {}
  ): StudentProgrammeEnrollment {
    const enrollment = new StudentProgrammeEnrollment({
      id,
      journeyId,
      studentId,
      programmeId,
      programmeVersionId,
      status: 'ACTIVE',
      ...options,
    });
    enrollment.addDomainEvent(new ProgrammeEnrolled(id, studentId, programmeId));
    return enrollment;
  }

  public withdraw(reason: string): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Only ACTIVE enrollments can be withdrawn');
    }
    this._status = 'WITHDRAWN';
    this._withdrawnAt = new Date();
    this._withdrawalReason = reason;
    this.addDomainEvent(new ProgrammeWithdrawn(this.id, reason));
  }

  public complete(): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Only ACTIVE enrollments can be completed');
    }
    this._status = 'COMPLETED';
    this._completedAt = new Date();
    this.addDomainEvent(new ProgrammeCompleted(this.id, this._programmeId));
  }

  public suspend(): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Only ACTIVE enrollments can be suspended');
    }
    this._status = 'SUSPENDED';
  }

  public reinstate(): void {
    if (this._status !== 'SUSPENDED') {
      throw new Error('Only SUSPENDED enrollments can be reinstated');
    }
    this._status = 'ACTIVE';
  }

  public updateModuleProgress(moduleId: string, completionPct: number): void {
    const mp = this._moduleProgress.find(m => m.moduleId === moduleId);
    if (!mp) throw new Error(`Module ${moduleId} not found in enrollment`);
    const pctVo = new CompletionPercentage(completionPct);
    void pctVo; // validated
  }

  // For repository hydration only — bypasses validation
  public _pushModuleProgress(mp: ModuleProgress): void {
    this._moduleProgress.push(mp);
  }
}

// ───────────────────────────────────────────────────────────────────
// AGGREGATE: LearningPlan (Rec 5 — Versioned)
// ───────────────────────────────────────────────────────────────────

export class LearningPlan extends AggregateRoot<string> {
  private _journeyId: string;
  private _studentId: string;
  private _title: string | undefined;
  private _status: 'ACTIVE' | 'ARCHIVED' | 'SUPERSEDED';
  private _versions: LearningPlanVersion[] = [];
  public lockVersion: number;

  constructor(props: {
    id: string;
    journeyId: string;
    studentId: string;
    title?: string | undefined;
    status: 'ACTIVE' | 'ARCHIVED' | 'SUPERSEDED';
    versions?: LearningPlanVersion[] | undefined;
    lockVersion?: number | undefined;
  }) {
    super(props.id);
    this._journeyId = props.journeyId;
    this._studentId = props.studentId;
    this._title = props.title;
    this._status = props.status;
    if (props.versions) this._versions = [...props.versions];
    this.lockVersion = props.lockVersion ?? 0;
  }

  get journeyId(): string { return this._journeyId; }
  get studentId(): string { return this._studentId; }
  get title(): string | undefined { return this._title; }
  get status(): 'ACTIVE' | 'ARCHIVED' | 'SUPERSEDED' { return this._status; }
  get versions(): readonly LearningPlanVersion[] { return this._versions; }
  get currentVersion(): LearningPlanVersion | undefined {
    return this._versions.find(v => v.isCurrent);
  }

  public static create(id: string, journeyId: string, studentId: string, title?: string): LearningPlan {
    return new LearningPlan({ id, journeyId, studentId, title, status: 'ACTIVE' });
  }

  public addVersion(props: {
    versionNo: string;
    source: LearningPlanSource;
    goals?: Record<string, any> | undefined;
    schedule?: Record<string, any> | undefined;
    notes?: string | undefined;
  }): LearningPlanVersion {
    if (this._status !== 'ACTIVE') {
      throw new Error('Cannot add a version to a non-ACTIVE learning plan');
    }
    const version = new LearningPlanVersion({
      id: randomUUID(),
      versionNo: props.versionNo,
      source: props.source,
      goals: props.goals,
      schedule: props.schedule,
      notes: props.notes,
      isCurrent: true,
      createdAt: new Date(),
    });
    this._versions.push(version);
    this.addDomainEvent(new LearningPlanUpdated(this._journeyId, this.id, props.versionNo));
    return version;
  }

  public archive(): void {
    if (this._status !== 'ACTIVE') throw new Error('Only ACTIVE plans can be archived');
    this._status = 'ARCHIVED';
  }

  public _pushVersion(v: LearningPlanVersion): void {
    this._versions.push(v);
  }
}

// ───────────────────────────────────────────────────────────────────
// AGGREGATE: StudentLearningJourney (Master)
// ───────────────────────────────────────────────────────────────────

export class StudentLearningJourney extends AggregateRoot<string> {
  private _studentId: string;
  private _status: JourneyStatus;
  private _goals: LearningGoal[] = [];
  private _milestones: LearningMilestone[] = [];
  private _competencies: CompetencyProgress[] = [];
  private _sessions: StudySession[] = [];
  private _achievements: Achievement[] = [];
  private _bookmarks: Bookmark[] = [];
  private _preferences: Map<string, string> = new Map();
  private _streak: StreakCount;
  private _health: JourneyHealth | undefined;
  private _consentGiven: boolean;
  private _dataRetentionPolicy: string | undefined;
  public lockVersion: number;

  constructor(props: {
    id: string;
    studentId: string;
    status: JourneyStatus;
    streak?: { current: number; longest: number } | undefined;
    consentGiven?: boolean | undefined;
    dataRetentionPolicy?: string | undefined;
    lockVersion?: number | undefined;
  }) {
    super(props.id);
    this._studentId = props.studentId;
    this._status = props.status;
    this._streak = new StreakCount(props.streak?.current ?? 0, props.streak?.longest ?? 0);
    this._consentGiven = props.consentGiven ?? false;
    this._dataRetentionPolicy = props.dataRetentionPolicy;
    this.lockVersion = props.lockVersion ?? 0;
  }

  // ── Getters ─────────────────────────────────────────────────────
  get studentId(): string { return this._studentId; }
  get status(): JourneyStatus { return this._status; }
  get goals(): readonly LearningGoal[] { return this._goals; }
  get milestones(): readonly LearningMilestone[] { return this._milestones; }
  get competencies(): readonly CompetencyProgress[] { return this._competencies; }
  get sessions(): readonly StudySession[] { return this._sessions; }
  get achievements(): readonly Achievement[] { return this._achievements; }
  get bookmarks(): readonly Bookmark[] { return this._bookmarks; }
  get streak(): StreakCount { return this._streak; }
  get health(): JourneyHealth | undefined { return this._health; }
  get consentGiven(): boolean { return this._consentGiven; }
  get dataRetentionPolicy(): string | undefined { return this._dataRetentionPolicy; }

  // ── Factory ──────────────────────────────────────────────────────
  public static create(id: string, studentId: string): StudentLearningJourney {
    const journey = new StudentLearningJourney({ id, studentId, status: 'CREATED' });
    journey.addDomainEvent(new StudentJourneyCreated(id, studentId));
    return journey;
  }

  // ── Lifecycle ────────────────────────────────────────────────────
  public activate(): void {
    if (this._status !== 'CREATED') {
      throw new Error(`Journey cannot be activated from status: ${this._status}`);
    }
    this._status = 'ACTIVE';
    this.addDomainEvent(new StudentJourneyActivated(this.id));
  }

  public pause(): void {
    if (this._status !== 'ACTIVE') {
      throw new Error(`Journey cannot be paused from status: ${this._status}`);
    }
    this._status = 'PAUSED';
    this.addDomainEvent(new StudentJourneyPaused(this.id));
  }

  public resume(): void {
    if (this._status !== 'PAUSED') {
      throw new Error(`Journey cannot be resumed from status: ${this._status}`);
    }
    this._status = 'ACTIVE';
    this.addDomainEvent(new StudentJourneyActivated(this.id));
  }

  public archive(): void {
    if (!['COMPLETED', 'PAUSED'].includes(this._status)) {
      throw new Error(`Journey cannot be archived from status: ${this._status}`);
    }
    this._status = 'ARCHIVED';
    this.addDomainEvent(new StudentJourneyArchived(this.id));
  }

  // ── Goals ────────────────────────────────────────────────────────
  public addGoal(goal: LearningGoal): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Goals can only be added to an ACTIVE journey');
    }
    const exists = this._goals.find(g => g.id === goal.id);
    if (exists) throw new Error(`Goal ${goal.id} already exists in this journey`);
    this._goals.push(goal);
    this.addDomainEvent(new GoalCreated(this.id, goal.id, goal.title));
  }

  public completeGoal(goalId: string): void {
    const goal = this._goals.find(g => g.id === goalId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);
    goal.complete(new Date());
    this.addDomainEvent(new GoalCompleted(this.id, goalId));
  }

  // ── Study Sessions ───────────────────────────────────────────────
  public startStudySession(session: StudySession): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Study sessions can only be started on an ACTIVE journey');
    }
    const overlapping = this._sessions.some(s => s.isActive);
    if (overlapping) {
      throw new Error('A study session is already in progress');
    }
    this._sessions.push(session);
    this.addDomainEvent(new StudySessionStarted(this.id, session.id, session.programmeId));
  }

  public endStudySession(sessionId: string, endedAt: Date, durationMs: number): void {
    const session = this._sessions.find(s => s.id === sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (!session.isActive) throw new Error(`Session ${sessionId} already ended`);
    session.end(endedAt, durationMs);
    // Update streak
    const today = new Date(endedAt);
    today.setHours(0, 0, 0, 0);
    const newCurrent = this._streak.current + 1;
    const newLongest = Math.max(newCurrent, this._streak.longest);
    this._streak = new StreakCount(newCurrent, newLongest);
    this.addDomainEvent(new StudySessionEnded(this.id, sessionId, durationMs));
    this.addDomainEvent(new StudyStreakUpdated(this.id, newCurrent, newLongest));
  }

  // ── Milestones ───────────────────────────────────────────────────
  public addMilestone(milestone: LearningMilestone): void {
    if (this._milestones.find(m => m.id === milestone.id)) {
      throw new Error(`Milestone ${milestone.id} already exists`);
    }
    this._milestones.push(milestone);
  }

  public completeMilestone(milestoneId: string): void {
    const milestone = this._milestones.find(m => m.id === milestoneId);
    if (!milestone) throw new Error(`Milestone ${milestoneId} not found`);
    milestone.markComplete(new Date());
    this.addDomainEvent(new MilestoneCompleted(this.id, milestoneId));
  }

  // ── Competencies ─────────────────────────────────────────────────
  public updateCompetency(competencyId: string, newScore: number, source?: string, actorId?: string): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Competencies can only be updated on an ACTIVE journey');
    }
    let cp = this._competencies.find(c => c.competencyId === competencyId);
    if (!cp) {
      cp = new CompetencyProgress({
        id: randomUUID(),
        competencyId,
        masteryScore: 0,
        lastUpdated: new Date(),
      });
      this._competencies.push(cp);
    }
    cp.update(newScore, source, actorId);
    this.addDomainEvent(new CompetencyUpdated(this.id, competencyId, newScore));
  }

  // ── Bookmarks (Rec 7 — Generalized) ─────────────────────────────
  public addBookmark(bookmark: Bookmark): void {
    const exists = this._bookmarks.find(
      b => b.resourceType === bookmark.resourceType && b.resourceId === bookmark.resourceId
    );
    if (exists) throw new Error(`Bookmark for ${bookmark.resourceType}:${bookmark.resourceId} already exists`);
    this._bookmarks.push(bookmark);
    this.addDomainEvent(new BookmarkAdded(this.id, bookmark.resourceType, bookmark.resourceId));
  }

  public removeBookmark(bookmarkId: string): void {
    const idx = this._bookmarks.findIndex(b => b.id === bookmarkId);
    if (idx === -1) throw new Error(`Bookmark ${bookmarkId} not found`);
    this._bookmarks.splice(idx, 1);
    this.addDomainEvent(new BookmarkRemoved(this.id, bookmarkId));
  }

  // ── Achievements ─────────────────────────────────────────────────
  public unlockAchievement(achievement: Achievement): void {
    const exists = this._achievements.find(a => a.achievementType === achievement.achievementType);
    if (exists) return; // Idempotent — already unlocked
    this._achievements.push(achievement);
    this.addDomainEvent(new AchievementUnlocked(this.id, achievement.achievementType, achievement.definitionId));
  }

  // ── Progress update ──────────────────────────────────────────────
  public recordLessonCompleted(lessonId: string): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Lesson progress can only be recorded on an ACTIVE journey');
    }
    this.addDomainEvent(new LessonCompleted(this.id, lessonId));
  }

  public recordModuleCompleted(moduleId: string): void {
    this.addDomainEvent(new ModuleCompleted(this.id, moduleId));
  }

  // ── Preferences ──────────────────────────────────────────────────
  public setPreference(key: string, value: string): void {
    this._preferences.set(key, value);
  }

  public getPreference(key: string): string | undefined {
    return this._preferences.get(key);
  }

  // ── Privacy (Rec 12) ─────────────────────────────────────────────
  public giveConsent(policy: string): void {
    this._consentGiven = true;
    this._dataRetentionPolicy = policy;
  }

  // ── Repository hydration helpers ─────────────────────────────────
  public _pushGoal(goal: LearningGoal): void { this._goals.push(goal); }
  public _pushMilestone(m: LearningMilestone): void { this._milestones.push(m); }
  public _pushCompetency(c: CompetencyProgress): void { this._competencies.push(c); }
  public _pushSession(s: StudySession): void { this._sessions.push(s); }
  public _pushAchievement(a: Achievement): void { this._achievements.push(a); }
  public _pushBookmark(b: Bookmark): void { this._bookmarks.push(b); }
  public _setHealth(h: JourneyHealth): void { this._health = h; }
  public _setStreak(current: number, longest: number): void {
    this._streak = new StreakCount(current, longest);
  }
  public _setPreferences(prefs: Map<string, string>): void {
    this._preferences = prefs;
  }
}
