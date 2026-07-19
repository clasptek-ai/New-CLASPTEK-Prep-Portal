import {
  LearningCoach,
  CoachBrain,
  CoachMemory,
  StudyGoal,
  CoachConversation,
  HabitTracker,
  HabitAnalytics,
  CoachingPlan,
  DailyStudyPlan,
  StudyPlanTask,
  ReflectionJournal,
  RevisionPlan,
  CoachInsight,
  CoachRecommendation,
  CoachNotification,
  CoachDashboardProjection,
  ConversationMessage,
  ConversationInsight,
  MotivationProfile,
  CoachingSession,
  GoalTarget,
  ReflectionEntry,
  RevisionCampaign,
  CoachingStyle,
  ConversationSummary,
  MotivationMessage,
  StudyTask,
  GoalStatus,
  GoalType,
  SessionType,
  PlanType,
  RecommendationType,
  RecommendationPriority,
  InsightCategory,
  InsightSeverity,
  NotificationType,
  NotificationChannel,
  HabitMood,
  ReflectionMood,
  CampaignType,
  ActiveEngine,
  StudyPlanningEngine,
  RevisionPlanningEngine,
  GoalPlanningEngine,
  ConversationEngine,
  MotivationEngine,
  CoachingContext,
  LearningStyle,
  MotivationStyle,
  RuleBasedStudyPlanningEngine,
  RuleBasedMotivationEngine,
} from '@clasptek/domain-learning-coach';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY CONTRACTS
// ═══════════════════════════════════════════════════════════════════

export interface LearningCoachRepository {
  save(coach: LearningCoach): Promise<void>;
  findById(id: string): Promise<LearningCoach | null>;
  findByStudent(studentId: string, profileId: string): Promise<LearningCoach | null>;
}

export interface CoachBrainRepository {
  save(brain: CoachBrain): Promise<void>;
  findByCoachId(coachId: string): Promise<CoachBrain | null>;
}

export interface CoachMemoryRepository {
  save(memory: CoachMemory): Promise<void>;
  findByCoachId(coachId: string): Promise<CoachMemory | null>;
}

export interface CoachingSessionRepository {
  save(session: CoachingSession): Promise<void>;
  findById(id: string): Promise<CoachingSession | null>;
  findActiveByCoach(coachId: string): Promise<CoachingSession | null>;
  findHistoryByCoach(coachId: string, limit?: number): Promise<CoachingSession[]>;
}

export interface CoachingPlanRepository {
  save(plan: CoachingPlan): Promise<void>;
  findById(id: string): Promise<CoachingPlan | null>;
  findCurrentByCoach(coachId: string): Promise<CoachingPlan | null>;
  findHistoryByCoach(coachId: string, limit?: number): Promise<CoachingPlan[]>;
}

export interface DailyStudyPlanRepository {
  save(plan: DailyStudyPlan, tasks: StudyPlanTask[]): Promise<void>;
  findByCoachAndDate(coachId: string, date: Date): Promise<DailyStudyPlan | null>;
  findHistoryByCoach(coachId: string, limit?: number): Promise<DailyStudyPlan[]>;
}

export interface RevisionPlanRepository {
  save(plan: RevisionPlan): Promise<void>;
  findById(id: string): Promise<RevisionPlan | null>;
  findActiveByCoach(coachId: string): Promise<RevisionPlan | null>;
}

export interface GoalRepository {
  save(goal: StudyGoal): Promise<void>;
  findById(id: string): Promise<StudyGoal | null>;
  findActiveByCoach(coachId: string): Promise<StudyGoal[]>;
  findByType(coachId: string, goalType: GoalType): Promise<StudyGoal[]>;
  findAtRisk(coachId: string): Promise<StudyGoal[]>;
}

export interface ConversationRepository {
  save(conversation: CoachConversation, messages: ConversationMessage[]): Promise<void>;
  findById(id: string): Promise<CoachConversation | null>;
  findActiveByCoach(coachId: string): Promise<CoachConversation | null>;
  findHistoryByCoach(coachId: string, limit?: number): Promise<CoachConversation[]>;
  archiveOlderThan(coachId: string, cutoffDate: Date): Promise<number>;
}

export interface HabitRepository {
  save(tracker: HabitTracker): Promise<void>;
  findByCoachAndDate(coachId: string, date: Date): Promise<HabitTracker | null>;
  findRecentByCoach(coachId: string, days: number): Promise<HabitTracker[]>;
}

export interface HabitAnalyticsRepository {
  save(analytics: HabitAnalytics): Promise<void>;
  findByCoachAndPeriod(coachId: string, periodType: 'WEEKLY' | 'MONTHLY', periodStart: Date): Promise<HabitAnalytics | null>;
  findLatestByCoach(coachId: string, periodType: 'WEEKLY' | 'MONTHLY'): Promise<HabitAnalytics | null>;
}

export interface ReflectionRepository {
  save(journal: ReflectionJournal): Promise<void>;
  findById(id: string): Promise<ReflectionJournal | null>;
  findHistoryByCoach(coachId: string, limit?: number): Promise<ReflectionJournal[]>;
}

export interface InsightRepository {
  save(insight: CoachInsight): Promise<void>;
  findById(id: string): Promise<CoachInsight | null>;
  findUnresolvedByCoach(coachId: string): Promise<CoachInsight[]>;
  findCriticalByCoach(coachId: string): Promise<CoachInsight[]>;
}

export interface NotificationRepository {
  save(notification: CoachNotification): Promise<void>;
  findById(id: string): Promise<CoachNotification | null>;
  findScheduledByCoach(coachId: string): Promise<CoachNotification[]>;
  findDueNotifications(before: Date): Promise<CoachNotification[]>;
}

export interface CoachDashboardProjectionRepository {
  save(projection: CoachDashboardProjection): Promise<void>;
  findByCoachId(coachId: string): Promise<CoachDashboardProjection | null>;
}

export interface MotivationProfileRepository {
  save(profile: MotivationProfile): Promise<void>;
  findByCoachId(coachId: string): Promise<MotivationProfile | null>;
}

// ═══════════════════════════════════════════════════════════════════
// 2. CROSS-CONTEXT READ PORTS (Rec 13 — never SELECT from other tables directly)
// ═══════════════════════════════════════════════════════════════════

export interface ReadinessInsightPort {
  getLatestPrediction(studentId: string, profileId: string): Promise<ReadinessSummary | null>;
}

export interface EvaluationInsightPort {
  getLatestEvaluationFeedback(studentId: string): Promise<EvaluationSummary | null>;
}

export interface LearningProgressPort {
  getLearnerVelocity(studentId: string): Promise<LearnerVelocitySummary | null>;
  getCompetencyMastery(studentId: string): Promise<CompetencyMasterySummary[]>;
}

export interface PracticeInsightPort {
  getWeakAreas(studentId: string): Promise<string[]>;
  getRecentPracticeStats(studentId: string): Promise<PracticeStatsSummary | null>;
}

export interface CurriculumPort {
  getCompetencyName(code: string): Promise<string | null>;
  getModuleForCompetency(code: string): Promise<string | null>;
}

// Cross-context data transfer objects
export interface ReadinessSummary {
  predictionId: string;
  overallScore: number;
  status: string;
  weakCompetencies: string[];
  strongCompetencies: string[];
  createdAt: Date;
}

export interface EvaluationSummary {
  evaluationId: string;
  skill: string;
  feedbackText: string;
  bandScore: number;
  createdAt: Date;
}

export interface LearnerVelocitySummary {
  studyStreak: number;
  weeklyVelocity: number;
  dailyAverageMinutes: number;
}

export interface CompetencyMasterySummary {
  competencyCode: string;
  masteryLevel: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface PracticeStatsSummary {
  totalSessions: number;
  accuracyRate: number;
  weakTopics: string[];
  bestTopics: string[];
}

// ═══════════════════════════════════════════════════════════════════
// 3. COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════

// ─── CreateCoachHandler ───────────────────────────────────────────
export interface CreateCoachCommand {
  studentId: string;
  profileId: string;
  stylePreference?: { tone?: string; pacing?: string } | undefined;
}

export class CreateCoachHandler {
  constructor(
    private readonly coachRepo: LearningCoachRepository,
    private readonly brainRepo: CoachBrainRepository,
    private readonly memoryRepo: CoachMemoryRepository,
    private readonly profileRepo: MotivationProfileRepository
  ) {}

  async execute(cmd: CreateCoachCommand): Promise<{ coach: LearningCoach; brain: CoachBrain }> {
    const existing = await this.coachRepo.findByStudent(cmd.studentId, cmd.profileId);
    if (existing) throw new Error(`Coach already exists for student ${cmd.studentId}`);

    const coach = LearningCoach.create({ studentId: cmd.studentId, profileId: cmd.profileId });
    const brain = CoachBrain.create(coach.id);
    const memory = CoachMemory.create(coach.id);
    const profile = new MotivationProfile({ id: randomUUID(), coachId: coach.id });

    await this.coachRepo.save(coach);
    await this.brainRepo.save(brain);
    await this.memoryRepo.save(memory);
    await this.profileRepo.save(profile);

    return { coach, brain };
  }
}

// ─── StartCoachingSessionHandler ─────────────────────────────────
export interface StartCoachingSessionCommand {
  coachId: string;
  sessionType: SessionType;
}

export class StartCoachingSessionHandler {
  constructor(private readonly sessionRepo: CoachingSessionRepository) {}

  async execute(cmd: StartCoachingSessionCommand): Promise<CoachingSession> {
    const session = CoachingSession.start(cmd.coachId, cmd.sessionType);
    await this.sessionRepo.save(session);
    return session;
  }
}

// ─── EndCoachingSessionHandler ────────────────────────────────────
export interface EndCoachingSessionCommand {
  sessionId: string;
  summary?: string | undefined;
}

export class EndCoachingSessionHandler {
  constructor(private readonly sessionRepo: CoachingSessionRepository) {}

  async execute(cmd: EndCoachingSessionCommand): Promise<CoachingSession> {
    const session = await this.sessionRepo.findById(cmd.sessionId);
    if (!session) throw new Error(`Session ${cmd.sessionId} not found`);
    session.end(cmd.summary);
    await this.sessionRepo.save(session);
    return session;
  }
}

// ─── GenerateStudyPlanHandler ─────────────────────────────────────
export interface GenerateStudyPlanCommand {
  coachId: string;
  studentId: string;
  profileId: string;
  planDate?: Date | undefined;
}

export class GenerateStudyPlanHandler {
  constructor(
    private readonly planRepo: DailyStudyPlanRepository,
    private readonly coachRepo: LearningCoachRepository,
    private readonly brainRepo: CoachBrainRepository,
    private readonly memoryRepo: CoachMemoryRepository,
    private readonly planningEngine: StudyPlanningEngine,
    private readonly readinessPort?: ReadinessInsightPort | undefined,
    private readonly practicePort?: PracticeInsightPort | undefined
  ) {}

  async execute(cmd: GenerateStudyPlanCommand): Promise<DailyStudyPlan> {
    const coach = await this.coachRepo.findById(cmd.coachId);
    if (!coach) throw new Error(`Coach ${cmd.coachId} not found`);
    if (coach.status !== 'ACTIVE') throw new Error('Coach is not active');

    const brain = await this.brainRepo.findByCoachId(cmd.coachId);
    const memory = await this.memoryRepo.findByCoachId(cmd.coachId);

    let readiness: ReadinessSummary | null = null;
    let practiceStats: PracticeStatsSummary | null = null;

    if (this.readinessPort) {
      readiness = await this.readinessPort.getLatestPrediction(cmd.studentId, cmd.profileId);
    }
    if (this.practicePort) {
      practiceStats = await this.practicePort.getRecentPracticeStats(cmd.studentId);
    }

    const context: CoachingContext = {
      coachId: cmd.coachId,
      studentId: cmd.studentId,
      profileId: cmd.profileId,
      readinessScore: readiness?.overallScore,
      weakCompetencies: readiness?.weakCompetencies ?? practiceStats?.weakTopics ?? memory?.weakestCompetencies,
      coachStyle: brain?.style,
      coachMemory: memory ?? undefined,
    };

    const planDate = cmd.planDate ?? new Date();
    const tasks = await this.planningEngine.generateDailyTasks(context);

    const dailyPlan = DailyStudyPlan.generate(cmd.coachId, planDate);
    const planTasks: StudyPlanTask[] = tasks.map((t, idx) =>
      new StudyPlanTask({
        id: randomUUID(),
        dailyPlanId: dailyPlan.id,
        taskType: t.taskType,
        title: t.title,
        competencyCode: t.competencyCode,
        resourceId: t.resourceId,
        description: t.description,
        estimatedMinutes: t.estimatedMinutes,
        priority: t.priority,
        sortOrder: idx
      })
    );

    planTasks.forEach(task => dailyPlan.addTask(task));
    await this.planRepo.save(dailyPlan, planTasks);
    return dailyPlan;
  }
}

// ─── GenerateRevisionPlanHandler ──────────────────────────────────
export interface GenerateRevisionPlanCommand {
  coachId: string;
  campaignType: CampaignType;
  startDate: Date;
  endDate: Date;
  focusAreas: string[];
  examDate?: Date | undefined;
}

export class GenerateRevisionPlanHandler {
  constructor(private readonly revisionPlanRepo: RevisionPlanRepository) {}

  async execute(cmd: GenerateRevisionPlanCommand): Promise<RevisionPlan> {
    const campaign = new RevisionCampaign({
      campaignType: cmd.campaignType,
      startDate: cmd.startDate,
      endDate: cmd.endDate,
      focusAreas: cmd.focusAreas,
      examDate: cmd.examDate
    });
    const plan = RevisionPlan.create(cmd.coachId, campaign);
    await this.revisionPlanRepo.save(plan);
    return plan;
  }
}

// ─── GenerateWeeklyPlanHandler ─────────────────────────────────────
export interface GenerateWeeklyPlanCommand {
  coachId: string;
  studentId: string;
  profileId: string;
  weekStartDate: Date;
}

export class GenerateWeeklyPlanHandler {
  constructor(
    private readonly planRepo: CoachingPlanRepository,
    private readonly planningEngine: StudyPlanningEngine,
    private readonly readinessPort?: ReadinessInsightPort | undefined
  ) {}

  async execute(cmd: GenerateWeeklyPlanCommand): Promise<CoachingPlan> {
    let readiness: ReadinessSummary | null = null;
    if (this.readinessPort) {
      readiness = await this.readinessPort.getLatestPrediction(cmd.studentId, cmd.profileId);
    }

    const context: CoachingContext = {
      coachId: cmd.coachId,
      studentId: cmd.studentId,
      profileId: cmd.profileId,
      readinessScore: readiness?.overallScore,
      weakCompetencies: readiness?.weakCompetencies ?? []
    };

    const planData = await this.planningEngine.generateWeeklyPlan(context, cmd.weekStartDate);
    const coachingPlan = CoachingPlan.create({
      coachId: cmd.coachId,
      planType: 'WEEKLY',
      startDate: planData.startDate,
      endDate: planData.endDate,
      focusCompetencies: planData.focusCompetencies,
      snapshotId: readiness ? readiness.predictionId : undefined,
      predictionScore: readiness ? readiness.overallScore : undefined,
    });
    coachingPlan.activate();
    await this.planRepo.save(coachingPlan);
    return coachingPlan;
  }
}

// ─── CreateGoalHandler ────────────────────────────────────────────
export interface CreateGoalCommand {
  coachId: string;
  goalType: GoalType;
  title: string;
  description?: string | undefined;
  targetValue: number;
  targetUnit: string;
  deadline?: Date | undefined;
  targetCompetency?: string | undefined;
}

export class CreateGoalHandler {
  constructor(private readonly goalRepo: GoalRepository) {}

  async execute(cmd: CreateGoalCommand): Promise<StudyGoal> {
    const target = new GoalTarget({
      targetType: cmd.goalType,
      targetValue: cmd.targetValue,
      targetUnit: cmd.targetUnit,
      deadline: cmd.deadline
    });
    const goal = StudyGoal.create({
      coachId: cmd.coachId,
      goalType: cmd.goalType,
      title: cmd.title,
      description: cmd.description,
      target
    });
    goal.activate();
    await this.goalRepo.save(goal);
    return goal;
  }
}

// ─── UpdateGoalProgressHandler ────────────────────────────────────
export interface UpdateGoalProgressCommand {
  goalId: string;
  newValue: number;
}

export class UpdateGoalProgressHandler {
  constructor(private readonly goalRepo: GoalRepository) {}

  async execute(cmd: UpdateGoalProgressCommand): Promise<StudyGoal> {
    const goal = await this.goalRepo.findById(cmd.goalId);
    if (!goal) throw new Error(`Goal ${cmd.goalId} not found`);
    goal.updateProgress(cmd.newValue);
    if (goal.progressPercent >= 100) goal.complete();
    await this.goalRepo.save(goal);
    return goal;
  }
}

// ─── CompleteGoalHandler ──────────────────────────────────────────
export class CompleteGoalHandler {
  constructor(private readonly goalRepo: GoalRepository) {}

  async execute(goalId: string): Promise<StudyGoal> {
    const goal = await this.goalRepo.findById(goalId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);
    goal.complete();
    await this.goalRepo.save(goal);
    return goal;
  }
}

// ─── UpdateHabitHandler ───────────────────────────────────────────
export interface UpdateHabitCommand {
  coachId: string;
  date: Date;
  studyMinutes: number;
  focusScore?: number | undefined;
  mood?: HabitMood | undefined;
  notes?: string | undefined;
}

export class UpdateHabitHandler {
  constructor(
    private readonly habitRepo: HabitRepository
  ) {}

  async execute(cmd: UpdateHabitCommand): Promise<HabitTracker> {
    let tracker = await this.habitRepo.findByCoachAndDate(cmd.coachId, cmd.date);
    if (!tracker) {
      tracker = HabitTracker.createForDate(cmd.coachId, cmd.date);
    }
    tracker.recordStudy(cmd.studyMinutes, cmd.focusScore);
    if (cmd.mood !== undefined) tracker.setMood(cmd.mood);
    if (cmd.notes !== undefined) tracker.notes = cmd.notes;
    await this.habitRepo.save(tracker);
    return tracker;
  }
}

// ─── RecordReflectionHandler ──────────────────────────────────────
export interface RecordReflectionCommand {
  coachId: string;
  mood: ReflectionMood;
  difficultyRating: number;
  insights?: string | undefined;
  whatWentWell?: string | undefined;
  whatWasDifficult?: string | undefined;
  nextSessionFocus?: string | undefined;
  sessionId?: string | undefined;
}

export class RecordReflectionHandler {
  constructor(private readonly reflectionRepo: ReflectionRepository) {}

  async execute(cmd: RecordReflectionCommand): Promise<ReflectionJournal> {
    const entry = new ReflectionEntry({
      mood: cmd.mood,
      difficultyRating: cmd.difficultyRating,
      insights: cmd.insights,
      whatWentWell: cmd.whatWentWell,
      whatWasDifficult: cmd.whatWasDifficult,
      nextSessionFocus: cmd.nextSessionFocus
    });
    const journal = ReflectionJournal.record({
      coachId: cmd.coachId,
      entry,
      sessionId: cmd.sessionId
    });
    await this.reflectionRepo.save(journal);
    return journal;
  }
}

// ─── GenerateMotivationHandler ────────────────────────────────────
export interface GenerateMotivationCommand {
  coachId: string;
  studentId: string;
  profileId: string;
  type: 'ENCOURAGEMENT' | 'RISK_ALERT' | 'ACHIEVEMENT';
  severity?: InsightSeverity | undefined;
  achievement?: string | undefined;
}

export class GenerateMotivationHandler {
  constructor(
    private readonly motivationEngine: MotivationEngine,
    private readonly notificationRepo: NotificationRepository,
    private readonly readinessPort?: ReadinessInsightPort | undefined
  ) {}

  async execute(cmd: GenerateMotivationCommand): Promise<MotivationMessage> {
    let readiness: ReadinessSummary | null = null;
    if (this.readinessPort) {
      readiness = await this.readinessPort.getLatestPrediction(cmd.studentId, cmd.profileId);
    }

    const context: CoachingContext = {
      coachId: cmd.coachId,
      studentId: cmd.studentId,
      profileId: cmd.profileId,
      readinessScore: readiness?.overallScore,
    };

    let message: MotivationMessage;
    if (cmd.type === 'RISK_ALERT' && cmd.severity) {
      message = await this.motivationEngine.generateRiskAlert(context, cmd.severity);
    } else if (cmd.type === 'ACHIEVEMENT' && cmd.achievement) {
      message = await this.motivationEngine.generateAchievement(context, cmd.achievement);
    } else {
      message = await this.motivationEngine.generateEncouragement(context);
    }

    const notification = CoachNotification.schedule({
      coachId: cmd.coachId,
      notificationType: 'MOTIVATION',
      channel: 'IN_APP',
      title: 'Your Coach Has a Message',
      body: message.content,
      scheduledAt: new Date()
    });
    await this.notificationRepo.save(notification);
    return message;
  }
}

// ─── ArchiveConversationHandler ───────────────────────────────────
export interface ArchiveConversationCommand {
  coachId: string;
  beforeDate: Date;
}

export class ArchiveConversationHandler {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(cmd: ArchiveConversationCommand): Promise<number> {
    return await this.conversationRepo.archiveOlderThan(cmd.coachId, cmd.beforeDate);
  }
}

// ─── GenerateInsightHandler ───────────────────────────────────────
export interface GenerateInsightCommand {
  coachId: string;
  category: InsightCategory;
  severity: InsightSeverity;
  confidence: number;
  insightText: string;
  createdFromPredictionId?: string | undefined;
  createdFromEvaluationId?: string | undefined;
}

export class GenerateInsightHandler {
  constructor(private readonly insightRepo: InsightRepository) {}

  async execute(cmd: GenerateInsightCommand): Promise<CoachInsight> {
    const insight = CoachInsight.create({
      coachId: cmd.coachId,
      category: cmd.category,
      severity: cmd.severity,
      confidence: cmd.confidence,
      insightText: cmd.insightText,
      createdFromPredictionId: cmd.createdFromPredictionId,
      createdFromEvaluationId: cmd.createdFromEvaluationId
    });
    await this.insightRepo.save(insight);
    return insight;
  }
}

// ─── ComputeHabitAnalyticsHandler ────────────────────────────────
export interface ComputeHabitAnalyticsCommand {
  coachId: string;
  periodType: 'WEEKLY' | 'MONTHLY';
  periodStart: Date;
}

export class ComputeHabitAnalyticsHandler {
  constructor(
    private readonly habitRepo: HabitRepository,
    private readonly analyticsRepo: HabitAnalyticsRepository
  ) {}

  async execute(cmd: ComputeHabitAnalyticsCommand): Promise<HabitAnalytics> {
    const periodEnd = new Date(cmd.periodStart);
    if (cmd.periodType === 'WEEKLY') periodEnd.setDate(periodEnd.getDate() + 6);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);

    const days = cmd.periodType === 'WEEKLY' ? 7 : 30;
    const trackers = await this.habitRepo.findRecentByCoach(cmd.coachId, days);

    const studiedDays = trackers.filter(t => t.studied);
    const totalMinutes = studiedDays.reduce((s, t) => s + t.studyMinutes, 0);
    const consistency = days > 0 ? (studiedDays.length / days) * 100 : 0;
    const avgMinutes = studiedDays.length > 0 ? totalMinutes / studiedDays.length : 0;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const found = trackers.find(t => t.habitDate.toISOString().split('T')[0] === dayStr);
      if (found?.studied) streak++;
      else break;
    }

    let existing = await this.analyticsRepo.findByCoachAndPeriod(cmd.coachId, cmd.periodType, cmd.periodStart);
    if (!existing) {
      existing = HabitAnalytics.create({ coachId: cmd.coachId, periodType: cmd.periodType, periodStart: cmd.periodStart, periodEnd });
    }
    existing.currentStreak = streak;
    existing.weeklyConsistency = cmd.periodType === 'WEEKLY' ? parseFloat(consistency.toFixed(2)) : existing.weeklyConsistency;
    existing.monthlyConsistency = cmd.periodType === 'MONTHLY' ? parseFloat(consistency.toFixed(2)) : existing.monthlyConsistency;
    existing.avgSessionMinutes = parseFloat(avgMinutes.toFixed(2));
    existing.computedAt = new Date();

    await this.analyticsRepo.save(existing);
    return existing;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. QUERY HANDLERS
// ═══════════════════════════════════════════════════════════════════

// ─── GetCoachHandler ──────────────────────────────────────────────
export class GetCoachHandler {
  constructor(
    private readonly coachRepo: LearningCoachRepository,
    private readonly brainRepo: CoachBrainRepository,
    private readonly memoryRepo: CoachMemoryRepository
  ) {}

  async execute(coachId: string): Promise<{ coach: LearningCoach; brain: CoachBrain | null; memory: CoachMemory | null }> {
    const coach = await this.coachRepo.findById(coachId);
    if (!coach) throw new Error(`Coach ${coachId} not found`);
    const brain = await this.brainRepo.findByCoachId(coachId);
    const memory = await this.memoryRepo.findByCoachId(coachId);
    return { coach, brain, memory };
  }
}

// ─── GetTodaysTasksHandler ────────────────────────────────────────
export class GetTodaysTasksHandler {
  constructor(private readonly planRepo: DailyStudyPlanRepository) {}

  async execute(coachId: string): Promise<DailyStudyPlan | null> {
    return await this.planRepo.findByCoachAndDate(coachId, new Date());
  }
}

// ─── GetCurrentPlanHandler ────────────────────────────────────────
export class GetCurrentPlanHandler {
  constructor(private readonly planRepo: CoachingPlanRepository) {}

  async execute(coachId: string): Promise<CoachingPlan | null> {
    return await this.planRepo.findCurrentByCoach(coachId);
  }
}

// ─── GetGoalsHandler ──────────────────────────────────────────────
export interface GetGoalsFilters {
  coachId: string;
  goalType?: GoalType | undefined;
  status?: GoalStatus | undefined;
}

export class GetGoalsHandler {
  constructor(private readonly goalRepo: GoalRepository) {}

  async execute(filters: GetGoalsFilters): Promise<StudyGoal[]> {
    if (filters.goalType) {
      return await this.goalRepo.findByType(filters.coachId, filters.goalType);
    }
    return await this.goalRepo.findActiveByCoach(filters.coachId);
  }
}

// ─── GetStudyHistoryHandler ───────────────────────────────────────
export class GetStudyHistoryHandler {
  constructor(private readonly planRepo: CoachingPlanRepository) {}

  async execute(coachId: string, limit?: number): Promise<CoachingPlan[]> {
    return await this.planRepo.findHistoryByCoach(coachId, limit ?? 10);
  }
}

// ─── GetConversationHistoryHandler ───────────────────────────────
export class GetConversationHistoryHandler {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(coachId: string, limit?: number): Promise<CoachConversation[]> {
    return await this.conversationRepo.findHistoryByCoach(coachId, limit ?? 20);
  }
}

// ─── GetHabitSummaryHandler ───────────────────────────────────────
export class GetHabitSummaryHandler {
  constructor(private readonly analyticsRepo: HabitAnalyticsRepository) {}

  async execute(coachId: string): Promise<HabitAnalytics | null> {
    return await this.analyticsRepo.findLatestByCoach(coachId, 'WEEKLY');
  }
}

// ─── GetReflectionHistoryHandler ─────────────────────────────────
export class GetReflectionHistoryHandler {
  constructor(private readonly reflectionRepo: ReflectionRepository) {}

  async execute(coachId: string, limit?: number): Promise<ReflectionJournal[]> {
    return await this.reflectionRepo.findHistoryByCoach(coachId, limit ?? 10);
  }
}

// ─── GetCoachDashboardHandler ─────────────────────────────────────
export class GetCoachDashboardHandler {
  constructor(
    private readonly dashboardRepo: CoachDashboardProjectionRepository,
    private readonly planRepo: DailyStudyPlanRepository,
    private readonly goalRepo: GoalRepository,
    private readonly habitRepo: HabitAnalyticsRepository,
    private readonly insightRepo: InsightRepository
  ) {}

  async execute(coachId: string): Promise<CoachDashboardProjection> {
    // Try cache first
    let projection = await this.dashboardRepo.findByCoachId(coachId);
    if (projection) return projection;

    // Build fresh
    projection = CoachDashboardProjection.createEmpty(coachId);
    const todayPlan = await this.planRepo.findByCoachAndDate(coachId, new Date());
    const goals = await this.goalRepo.findActiveByCoach(coachId);
    const atRiskGoals = goals.filter(g => g.status === 'AT_RISK');
    const completedGoals = goals.filter(g => g.status === 'COMPLETED');
    const criticalInsights = await this.insightRepo.findCriticalByCoach(coachId);
    const habitAnalytics = await this.habitRepo.findLatestByCoach(coachId, 'WEEKLY');

    projection.todayTasks = todayPlan ? todayPlan.tasks.map(t => ({
      id: t.id, taskType: t.taskType, title: t.title, estimatedMinutes: t.estimatedMinutes, status: t.status
    })) : [];
    projection.goalSummary = {
      active: goals.length,
      completed: completedGoals.length,
      atRisk: atRiskGoals.length,
      failed: goals.filter(g => g.status === 'FAILED').length
    };
    projection.habitSummary = {
      streak: habitAnalytics?.currentStreak ?? 0,
      consistency: habitAnalytics?.weeklyConsistency ?? 0,
      todayStudied: false
    };
    projection.criticalInsights = criticalInsights.map(i => ({
      id: i.id, category: i.category, severity: i.severity, insightText: i.insightText
    }));
    projection.lastComputedAt = new Date();

    await this.dashboardRepo.save(projection);
    return projection;
  }
}

// Re-export domain types needed by consumers
export {
  LearningCoach, CoachBrain, CoachMemory, StudyGoal, CoachConversation,
  HabitTracker, HabitAnalytics, CoachingPlan, DailyStudyPlan, StudyPlanTask,
  ReflectionJournal, RevisionPlan, CoachInsight, CoachRecommendation,
  CoachNotification, CoachDashboardProjection, ConversationMessage,
  ConversationInsight, MotivationProfile, CoachingSession,
  GoalTarget, ReflectionEntry, RevisionCampaign, CoachingStyle, ConversationSummary,
  MotivationMessage, StudyTask, RuleBasedStudyPlanningEngine, RuleBasedMotivationEngine,
  GoalStatus, GoalType, SessionType, PlanType, RecommendationType, RecommendationPriority,
  InsightCategory, InsightSeverity, NotificationType, NotificationChannel,
  HabitMood, ReflectionMood, CampaignType, ActiveEngine, LearningStyle, MotivationStyle,
};
export type { StudyPlanningEngine, RevisionPlanningEngine, GoalPlanningEngine, ConversationEngine, MotivationEngine, CoachingContext };
