import { describe, test, expect, vi } from 'vitest';
import {
  CreateCoachHandler,
  StartCoachingSessionHandler,
  EndCoachingSessionHandler,
  GenerateStudyPlanHandler,
  CreateGoalHandler,
  CompleteGoalHandler,
  UpdateHabitHandler,
  RecordReflectionHandler,
  GenerateInsightHandler,
  GetCoachDashboardHandler,
  LearningCoachRepository,
  CoachBrainRepository,
  CoachMemoryRepository,
  CoachingSessionRepository,
  CoachingPlanRepository,
  DailyStudyPlanRepository,
  GoalRepository,
  HabitRepository,
  HabitAnalyticsRepository,
  ReflectionRepository,
  InsightRepository,
  NotificationRepository,
  CoachDashboardProjectionRepository,
  MotivationProfileRepository,
} from './index';
import {
  LearningCoach,
  CoachBrain,
  CoachMemory,
  StudyGoal,
  HabitTracker,
  HabitAnalytics,
  CoachingPlan,
  DailyStudyPlan,
  StudyPlanTask,
  ReflectionJournal,
  CoachInsight,
  CoachDashboardProjection,
  MotivationProfile,
  CoachingSession,
  RuleBasedStudyPlanningEngine,
} from '@clasptek/domain-learning-coach';

// ═══════════════════════════════════════════════════════════════════
// MOCK REPOSITORIES
// ═══════════════════════════════════════════════════════════════════
const createMockRepos = () => {
  const coachDb = new Map<string, LearningCoach>();
  const brainDb = new Map<string, CoachBrain>();
  const memoryDb = new Map<string, CoachMemory>();
  const sessionDb = new Map<string, CoachingSession>();
  const planDb = new Map<string, CoachingPlan>();
  const dailyPlanDb = new Map<string, DailyStudyPlan>();
  const taskDb = new Map<string, StudyPlanTask[]>();
  const goalDb = new Map<string, StudyGoal>();
  const habitDb = new Map<string, HabitTracker>();
  const analyticsDb = new Map<string, HabitAnalytics>();
  const reflectionDb = new Map<string, ReflectionJournal>();
  const insightDb = new Map<string, CoachInsight>();
  const notificationDb = new Map<string, any>();
  const dashboardDb = new Map<string, CoachDashboardProjection>();
  const profileDb = new Map<string, MotivationProfile>();

  const coachRepo: LearningCoachRepository = {
    save: vi.fn().mockImplementation(async (c: LearningCoach) => { coachDb.set(c.id, c); }),
    findById: vi.fn().mockImplementation(async (id: string) => coachDb.get(id) ?? null),
    findByStudent: vi.fn().mockImplementation(async (_sid: string, _pid: string) => null),
  };

  const brainRepo: CoachBrainRepository = {
    save: vi.fn().mockImplementation(async (b: CoachBrain) => { brainDb.set(b.coachId, b); }),
    findByCoachId: vi.fn().mockImplementation(async (id: string) => brainDb.get(id) ?? null),
  };

  const memoryRepo: CoachMemoryRepository = {
    save: vi.fn().mockImplementation(async (m: CoachMemory) => { memoryDb.set(m.coachId, m); }),
    findByCoachId: vi.fn().mockImplementation(async (id: string) => memoryDb.get(id) ?? null),
  };

  const sessionRepo: CoachingSessionRepository = {
    save: vi.fn().mockImplementation(async (s: CoachingSession) => { sessionDb.set(s.id, s); }),
    findById: vi.fn().mockImplementation(async (id: string) => sessionDb.get(id) ?? null),
    findActiveByCoach: vi.fn().mockResolvedValue(null),
    findHistoryByCoach: vi.fn().mockResolvedValue([]),
  };

  const planRepo: CoachingPlanRepository = {
    save: vi.fn().mockImplementation(async (p: CoachingPlan) => { planDb.set(p.id, p); }),
    findById: vi.fn().mockImplementation(async (id: string) => planDb.get(id) ?? null),
    findCurrentByCoach: vi.fn().mockResolvedValue(null),
    findHistoryByCoach: vi.fn().mockResolvedValue([]),
  };

  const dailyPlanRepo: DailyStudyPlanRepository = {
    save: vi.fn().mockImplementation(async (p: DailyStudyPlan, tasks: StudyPlanTask[]) => {
      dailyPlanDb.set(p.id, p);
      taskDb.set(p.id, tasks);
    }),
    findByCoachAndDate: vi.fn().mockResolvedValue(null),
    findHistoryByCoach: vi.fn().mockResolvedValue([]),
  };

  const goalRepo: GoalRepository = {
    save: vi.fn().mockImplementation(async (g: StudyGoal) => { goalDb.set(g.id, g); }),
    findById: vi.fn().mockImplementation(async (id: string) => goalDb.get(id) ?? null),
    findActiveByCoach: vi.fn().mockImplementation(async (_id: string) => Array.from(goalDb.values())),
    findByType: vi.fn().mockImplementation(async (_coachId: string, type: string) =>
      Array.from(goalDb.values()).filter(g => g.goalType === type)),
    findAtRisk: vi.fn().mockResolvedValue([]),
  };

  const habitRepo: HabitRepository = {
    save: vi.fn().mockImplementation(async (h: HabitTracker) => { habitDb.set(h.id, h); }),
    findByCoachAndDate: vi.fn().mockResolvedValue(null),
    findRecentByCoach: vi.fn().mockResolvedValue([]),
  };

  const analyticsRepo: HabitAnalyticsRepository = {
    save: vi.fn().mockImplementation(async (a: HabitAnalytics) => { analyticsDb.set(a.coachId, a); }),
    findByCoachAndPeriod: vi.fn().mockResolvedValue(null),
    findLatestByCoach: vi.fn().mockResolvedValue(null),
  };

  const reflectionRepo: ReflectionRepository = {
    save: vi.fn().mockImplementation(async (r: ReflectionJournal) => { reflectionDb.set(r.id, r); }),
    findById: vi.fn().mockImplementation(async (id: string) => reflectionDb.get(id) ?? null),
    findHistoryByCoach: vi.fn().mockResolvedValue([]),
  };

  const insightRepo: InsightRepository = {
    save: vi.fn().mockImplementation(async (i: CoachInsight) => { insightDb.set(i.id, i); }),
    findById: vi.fn().mockImplementation(async (id: string) => insightDb.get(id) ?? null),
    findUnresolvedByCoach: vi.fn().mockResolvedValue([]),
    findCriticalByCoach: vi.fn().mockResolvedValue([]),
  };

  const notificationRepo: NotificationRepository = {
    save: vi.fn().mockImplementation(async (n: any) => { notificationDb.set(n.id, n); }),
    findById: vi.fn().mockResolvedValue(null),
    findScheduledByCoach: vi.fn().mockResolvedValue([]),
    findDueNotifications: vi.fn().mockResolvedValue([]),
  };

  const dashboardRepo: CoachDashboardProjectionRepository = {
    save: vi.fn().mockImplementation(async (d: CoachDashboardProjection) => { dashboardDb.set(d.coachId, d); }),
    findByCoachId: vi.fn().mockResolvedValue(null),
  };

  const profileRepo: MotivationProfileRepository = {
    save: vi.fn().mockImplementation(async (p: MotivationProfile) => { profileDb.set(p.coachId, p); }),
    findByCoachId: vi.fn().mockResolvedValue(null),
  };

  return {
    coachRepo, brainRepo, memoryRepo, sessionRepo, planRepo, dailyPlanRepo,
    goalRepo, habitRepo, analyticsRepo, reflectionRepo, insightRepo,
    notificationRepo, dashboardRepo, profileRepo,
    coachDb, brainDb, memoryDb, goalDb, habitDb, analyticsDb
  };
};

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe('CreateCoachHandler', () => {
  test('creates coach with brain, memory and profile', async () => {
    const { coachRepo, brainRepo, memoryRepo, profileRepo } = createMockRepos();
    const handler = new CreateCoachHandler(coachRepo, brainRepo, memoryRepo, profileRepo);
    const { coach, brain } = await handler.execute({ studentId: 'student-1', profileId: 'profile-1' });
    expect(coach.studentId).toBe('student-1');
    expect(brain.coachId).toBe(coach.id);
    expect(coachRepo.save).toHaveBeenCalledOnce();
    expect(brainRepo.save).toHaveBeenCalledOnce();
    expect(memoryRepo.save).toHaveBeenCalledOnce();
    expect(profileRepo.save).toHaveBeenCalledOnce();
  });

  test('throws if coach already exists', async () => {
    const { coachRepo, brainRepo, memoryRepo, profileRepo } = createMockRepos();
    const existing = LearningCoach.create({ studentId: 's1', profileId: 'p1' });
    vi.mocked(coachRepo.findByStudent).mockResolvedValue(existing);
    const handler = new CreateCoachHandler(coachRepo, brainRepo, memoryRepo, profileRepo);
    await expect(handler.execute({ studentId: 's1', profileId: 'p1' })).rejects.toThrow('Coach already exists');
  });
});

describe('StartCoachingSessionHandler + EndCoachingSessionHandler', () => {
  test('starts and ends a session', async () => {
    const { sessionRepo } = createMockRepos();
    const startHandler = new StartCoachingSessionHandler(sessionRepo);
    const session = await startHandler.execute({ coachId: 'coach-1', sessionType: 'DAILY_CHECK_IN' });
    expect(session.status).toBe('ACTIVE');

    vi.mocked(sessionRepo.findById).mockResolvedValue(session);
    const endHandler = new EndCoachingSessionHandler(sessionRepo);
    const ended = await endHandler.execute({ sessionId: session.id, summary: 'Great session' });
    expect(ended.status).toBe('COMPLETED');
    expect(ended.summary).toBe('Great session');
  });
});

describe('GenerateStudyPlanHandler', () => {
  test('generates study plan with tasks', async () => {
    const { dailyPlanRepo, coachRepo, brainRepo, memoryRepo } = createMockRepos();
    const coach = LearningCoach.create({ studentId: 's1', profileId: 'p1' });
    vi.mocked(coachRepo.findById).mockResolvedValue(coach);
    vi.mocked(brainRepo.findByCoachId).mockResolvedValue(null);
    vi.mocked(memoryRepo.findByCoachId).mockResolvedValue(null);

    const handler = new GenerateStudyPlanHandler(
      dailyPlanRepo, coachRepo, brainRepo, memoryRepo,
      new RuleBasedStudyPlanningEngine()
    );
    const plan = await handler.execute({ coachId: coach.id, studentId: 's1', profileId: 'p1' });
    expect(plan).toBeDefined();
    expect(plan.coachId).toBe(coach.id);
    expect(dailyPlanRepo.save).toHaveBeenCalledOnce();
  });
});

describe('CreateGoalHandler + CompleteGoalHandler', () => {
  test('creates a WEEKLY goal as ACTIVE', async () => {
    const { goalRepo } = createMockRepos();
    const handler = new CreateGoalHandler(goalRepo);
    const goal = await handler.execute({
      coachId: 'coach-1',
      goalType: 'WEEKLY',
      title: 'Study 5 hours this week',
      targetValue: 300,
      targetUnit: 'minutes'
    });
    expect(goal.status).toBe('ACTIVE');
    expect(goal.goalType).toBe('WEEKLY');
  });

  test('completes a goal', async () => {
    const { goalRepo } = createMockRepos();
    const createHandler = new CreateGoalHandler(goalRepo);
    const goal = await createHandler.execute({
      coachId: 'coach-1',
      goalType: 'DAILY',
      title: 'Study 1 hour',
      targetValue: 60,
      targetUnit: 'minutes'
    });
    vi.mocked(goalRepo.findById).mockResolvedValue(goal);

    const completeHandler = new CompleteGoalHandler(goalRepo);
    const completed = await completeHandler.execute(goal.id);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBeDefined();
  });
});

describe('UpdateHabitHandler', () => {
  test('creates new habit tracker if none exists', async () => {
    const { habitRepo } = createMockRepos();
    const handler = new UpdateHabitHandler(habitRepo);
    const tracker = await handler.execute({
      coachId: 'coach-1', date: new Date(), studyMinutes: 60, mood: 'GOOD'
    });
    expect(tracker.studied).toBe(true);
    expect(tracker.studyMinutes).toBe(60);
    expect(tracker.mood).toBe('GOOD');
  });
});

describe('RecordReflectionHandler', () => {
  test('records a reflection entry', async () => {
    const { reflectionRepo } = createMockRepos();
    const handler = new RecordReflectionHandler(reflectionRepo);
    const journal = await handler.execute({
      coachId: 'coach-1',
      mood: 'POSITIVE',
      difficultyRating: 3,
      whatWentWell: 'Completed all tasks',
      nextSessionFocus: 'Grammar'
    });
    expect(journal.entry.mood).toBe('POSITIVE');
    expect(journal.entry.difficultyRating).toBe(3);
    expect(journal.entry.whatWentWell).toBe('Completed all tasks');
  });
});

describe('GenerateInsightHandler', () => {
  test('generates and saves a coach insight', async () => {
    const { insightRepo } = createMockRepos();
    const handler = new GenerateInsightHandler(insightRepo);
    const insight = await handler.execute({
      coachId: 'coach-1',
      category: 'WRITING',
      severity: 'HIGH',
      confidence: 0.85,
      insightText: 'Writing coherence is improving'
    });
    expect(insight.severity).toBe('HIGH');
    expect(insight.resolved).toBe(false);
    expect(insightRepo.save).toHaveBeenCalledOnce();
  });
});

describe('GetCoachDashboardHandler', () => {
  test('builds projection from scratch when cache is empty', async () => {
    const { dashboardRepo, dailyPlanRepo, goalRepo, analyticsRepo, insightRepo } = createMockRepos();
    const handler = new GetCoachDashboardHandler(
      dashboardRepo, dailyPlanRepo, goalRepo, analyticsRepo, insightRepo
    );
    const projection = await handler.execute('coach-1');
    expect(projection.coachId).toBe('coach-1');
    expect(projection.todayTasks).toEqual([]);
    expect(projection.goalSummary.active).toBe(0);
    expect(dashboardRepo.save).toHaveBeenCalledOnce();
  });
});
