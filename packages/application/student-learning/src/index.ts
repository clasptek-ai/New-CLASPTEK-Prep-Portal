import {
  StudentLearningJourney,
  StudentProgrammeEnrollment,
  LearningPlan,
  LearningGoal,
  StudySession,
  Bookmark,
  StudentDashboardProjection,
  type JourneyStatus,
  type GoalPriority,
  type GoalStatus,
  type BookmarkResourceType,
  type LearningPlanSource,
} from '@clasptek/domain-student-learning';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY INTERFACES (Rec 13 — Frozen Contracts)
// ═══════════════════════════════════════════════════════════════════

/**
 * @contract StudentLearningRepository
 * @frozen Sprint 2.5
 * Breaking changes to this interface require a new ADR.
 */
export interface StudentLearningRepository {
  save(journey: StudentLearningJourney): Promise<void>;
  findById(id: string): Promise<StudentLearningJourney | null>;
  findByStudent(studentId: string): Promise<StudentLearningJourney | null>;
  findActive(studentId: string): Promise<StudentLearningJourney | null>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  search(filters: StudentLearningSearchFilters): Promise<StudentLearningJourney[]>;
  nextIdentity(): string;
}

/**
 * @contract ProgrammeEnrollmentRepository
 * @frozen Sprint 2.5
 */
export interface ProgrammeEnrollmentRepository {
  save(enrollment: StudentProgrammeEnrollment): Promise<void>;
  findById(id: string): Promise<StudentProgrammeEnrollment | null>;
  findByJourney(journeyId: string): Promise<StudentProgrammeEnrollment[]>;
  findByStudentAndProgramme(studentId: string, programmeId: string): Promise<StudentProgrammeEnrollment | null>;
  findActive(journeyId: string): Promise<StudentProgrammeEnrollment[]>;
  nextIdentity(): string;
}

/**
 * @contract LearningPlanRepository
 * @frozen Sprint 2.5
 */
export interface LearningPlanRepository {
  save(plan: LearningPlan): Promise<void>;
  findById(id: string): Promise<LearningPlan | null>;
  findByJourney(journeyId: string): Promise<LearningPlan[]>;
  findActive(journeyId: string): Promise<LearningPlan | null>;
  nextIdentity(): string;
}

/**
 * @contract DashboardProjectionRepository
 * @frozen Sprint 2.5
 */
export interface DashboardProjectionRepository {
  save(projection: StudentDashboardProjection): Promise<void>;
  findByStudent(studentId: string): Promise<StudentDashboardProjection | null>;
  findByJourney(journeyId: string): Promise<StudentDashboardProjection | null>;
}

// ═══════════════════════════════════════════════════════════════════
// 2. SEARCH FILTERS
// ═══════════════════════════════════════════════════════════════════

export interface StudentLearningSearchFilters {
  studentId?: string;
  status?: JourneyStatus;
  programmeId?: string;
  goalStatus?: GoalStatus;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// ═══════════════════════════════════════════════════════════════════
// 3. COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════

// ─── 3.1 CreateJourneyHandler ────────────────────────────────────

export class CreateJourneyHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: { studentId: string }): Promise<string> {
    const existing = await this.journeyRepo.findByStudent(cmd.studentId);
    if (existing) {
      throw new Error(`Student ${cmd.studentId} already has a learning journey`);
    }
    const id = this.journeyRepo.nextIdentity();
    const journey = StudentLearningJourney.create(id, cmd.studentId);
    await this.journeyRepo.save(journey);
    return id;
  }
}

// ─── 3.2 ActivateJourneyHandler ─────────────────────────────────

export class ActivateJourneyHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: { journeyId: string }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.activate();
    await this.journeyRepo.save(journey);
  }
}

// ─── 3.3 PauseJourneyHandler ─────────────────────────────────────

export class PauseJourneyHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: { journeyId: string }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.pause();
    await this.journeyRepo.save(journey);
  }
}

// ─── 3.4 EnrolProgrammeHandler ───────────────────────────────────

export class EnrolProgrammeHandler {
  constructor(
    private readonly journeyRepo: StudentLearningRepository,
    private readonly enrollmentRepo: ProgrammeEnrollmentRepository
  ) {}

  public async execute(cmd: {
    journeyId: string;
    programmeId: string;
    programmeVersionId: string;
    deliveryMode?: string;
    cohortId?: string;
    intakeDate?: Date;
  }): Promise<string> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    if (journey.status !== 'ACTIVE') throw new Error('Journey must be ACTIVE to enrol in a programme');

    const existing = await this.enrollmentRepo.findByStudentAndProgramme(
      journey.studentId, cmd.programmeId
    );
    if (existing && existing.status === 'ACTIVE') {
      throw new Error(`Already enrolled in programme ${cmd.programmeId}`);
    }

    const id = this.enrollmentRepo.nextIdentity();
    const enrollment = StudentProgrammeEnrollment.create(
      id,
      cmd.journeyId,
      journey.studentId,
      cmd.programmeId,
      cmd.programmeVersionId,
      { deliveryMode: cmd.deliveryMode, cohortId: cmd.cohortId, intakeDate: cmd.intakeDate }
    );
    await this.enrollmentRepo.save(enrollment);
    return id;
  }
}

// ─── 3.5 WithdrawProgrammeHandler ────────────────────────────────

export class WithdrawProgrammeHandler {
  constructor(private readonly enrollmentRepo: ProgrammeEnrollmentRepository) {}

  public async execute(cmd: { enrollmentId: string; reason: string }): Promise<void> {
    const enrollment = await this.enrollmentRepo.findById(cmd.enrollmentId);
    if (!enrollment) throw new Error(`Enrollment ${cmd.enrollmentId} not found`);
    enrollment.withdraw(cmd.reason);
    await this.enrollmentRepo.save(enrollment);
  }
}

// ─── 3.6 CreateLearningGoalHandler ───────────────────────────────

export class CreateLearningGoalHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: {
    journeyId: string;
    title: string;
    priority: GoalPriority;
    programmeId?: string;
    description?: string;
    targetDate?: Date;
  }): Promise<string> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);

    const goalId = randomUUID();
    const goal = new LearningGoal({
      id: goalId,
      programmeId: cmd.programmeId,
      title: cmd.title,
      description: cmd.description,
      priority: cmd.priority,
      status: 'ACTIVE',
      targetDate: cmd.targetDate,
    });

    journey.addGoal(goal);
    await this.journeyRepo.save(journey);
    return goalId;
  }
}

// ─── 3.7 CompleteGoalHandler ─────────────────────────────────────

export class CompleteGoalHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: { journeyId: string; goalId: string }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.completeGoal(cmd.goalId);
    await this.journeyRepo.save(journey);
  }
}

// ─── 3.8 StartStudySessionHandler ────────────────────────────────

export class StartStudySessionHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: {
    journeyId: string;
    programmeId?: string;
    deviceType?: string;
    platform?: string;
    ipHash?: string;
    timezone?: string;
  }): Promise<string> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);

    const sessionId = randomUUID();
    const session = new StudySession({
      id: sessionId,
      programmeId: cmd.programmeId,
      startedAt: new Date(),
      deviceType: cmd.deviceType,
      platform: cmd.platform,
      ipHash: cmd.ipHash,
      timezone: cmd.timezone,
    });

    journey.startStudySession(session);
    await this.journeyRepo.save(journey);
    return sessionId;
  }
}

// ─── 3.9 EndStudySessionHandler ──────────────────────────────────

export class EndStudySessionHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: {
    journeyId: string;
    sessionId: string;
    durationMs: number;
    completionReason?: string;
  }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.endStudySession(cmd.sessionId, new Date(), cmd.durationMs);
    await this.journeyRepo.save(journey);
  }
}

// ─── 3.10 UpdateCompetencyHandler ────────────────────────────────

export class UpdateCompetencyHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: {
    journeyId: string;
    competencyId: string;
    newScore: number;
    source?: string;
    actorId?: string;
  }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.updateCompetency(cmd.competencyId, cmd.newScore, cmd.source, cmd.actorId);
    await this.journeyRepo.save(journey);
  }
}

// ─── 3.11 BookmarkResourceHandler ────────────────────────────────

export class BookmarkResourceHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: {
    journeyId: string;
    resourceType: BookmarkResourceType;
    resourceId: string;
    notes?: string;
  }): Promise<string> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);

    const bookmarkId = randomUUID();
    const bookmark = new Bookmark({
      id: bookmarkId,
      resourceType: cmd.resourceType,
      resourceId: cmd.resourceId,
      notes: cmd.notes,
      createdAt: new Date(),
    });

    journey.addBookmark(bookmark);
    await this.journeyRepo.save(journey);
    return bookmarkId;
  }
}

// ─── 3.12 RemoveBookmarkHandler ──────────────────────────────────

export class RemoveBookmarkHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: { journeyId: string; bookmarkId: string }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.removeBookmark(cmd.bookmarkId);
    await this.journeyRepo.save(journey);
  }
}

// ─── 3.13 ArchiveJourneyHandler ──────────────────────────────────

export class ArchiveJourneyHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: { journeyId: string }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.archive();
    await this.journeyRepo.save(journey);
  }
}

// ─── 3.14 CreateLearningPlanHandler ──────────────────────────────

export class CreateLearningPlanHandler {
  constructor(private readonly planRepo: LearningPlanRepository) {}

  public async execute(cmd: {
    journeyId: string;
    studentId: string;
    title?: string;
    versionSource: LearningPlanSource;
    goals?: Record<string, any>;
    schedule?: Record<string, any>;
    notes?: string;
  }): Promise<string> {
    const id = this.planRepo.nextIdentity();
    const plan = LearningPlan.create(id, cmd.journeyId, cmd.studentId, cmd.title);
    plan.addVersion({
      versionNo: '1.0.0',
      source: cmd.versionSource,
      goals: cmd.goals,
      schedule: cmd.schedule,
      notes: cmd.notes,
    });
    await this.planRepo.save(plan);
    return id;
  }
}

// ─── 3.15 CompleteMilestoneHandler ───────────────────────────────

export class CompleteMilestoneHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(cmd: { journeyId: string; milestoneId: string }): Promise<void> {
    const journey = await this.journeyRepo.findById(cmd.journeyId);
    if (!journey) throw new Error(`Journey ${cmd.journeyId} not found`);
    journey.completeMilestone(cmd.milestoneId);
    await this.journeyRepo.save(journey);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. QUERY HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class GetJourneyHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(query: { journeyId?: string; studentId?: string }): Promise<StudentLearningJourney | null> {
    if (query.journeyId) return this.journeyRepo.findById(query.journeyId);
    if (query.studentId) return this.journeyRepo.findActive(query.studentId);
    return null;
  }
}

export class GetEnrollmentsHandler {
  constructor(private readonly enrollmentRepo: ProgrammeEnrollmentRepository) {}

  public async execute(query: { journeyId: string; activeOnly?: boolean }): Promise<StudentProgrammeEnrollment[]> {
    if (query.activeOnly) return this.enrollmentRepo.findActive(query.journeyId);
    return this.enrollmentRepo.findByJourney(query.journeyId);
  }
}

export class GetLearningPlanHandler {
  constructor(private readonly planRepo: LearningPlanRepository) {}

  public async execute(query: { journeyId: string }): Promise<LearningPlan | null> {
    return this.planRepo.findActive(query.journeyId);
  }
}

export class GetDashboardHandler {
  constructor(private readonly projectionRepo: DashboardProjectionRepository) {}

  public async execute(query: { studentId: string }): Promise<StudentDashboardProjection | null> {
    return this.projectionRepo.findByStudent(query.studentId);
  }
}

export class SearchJourneysHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(filters: StudentLearningSearchFilters): Promise<StudentLearningJourney[]> {
    return this.journeyRepo.search(filters);
  }
}

export class GetStudyStatisticsHandler {
  constructor(private readonly journeyRepo: StudentLearningRepository) {}

  public async execute(query: { journeyId: string }): Promise<{
    totalSessions: number;
    totalStudyTimeMs: number;
    currentStreak: number;
    longestStreak: number;
    goalsCompleted: number;
    milestonesCompleted: number;
  }> {
    const journey = await this.journeyRepo.findById(query.journeyId);
    if (!journey) throw new Error(`Journey ${query.journeyId} not found`);

    const totalStudyTimeMs = journey.sessions.reduce((acc, s) => acc + (s.durationMs ?? 0), 0);
    return {
      totalSessions: journey.sessions.length,
      totalStudyTimeMs,
      currentStreak: journey.streak.current,
      longestStreak: journey.streak.longest,
      goalsCompleted: journey.goals.filter(g => g.status === 'COMPLETED').length,
      milestonesCompleted: journey.milestones.filter(m => m.completed).length,
    };
  }
}
