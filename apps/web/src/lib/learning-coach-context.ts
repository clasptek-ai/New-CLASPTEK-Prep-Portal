import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresLearningCoachRepository,
  PostgresCoachBrainRepository,
  PostgresCoachMemoryRepository,
  PostgresGoalRepository,
  PostgresHabitRepository,
  PostgresHabitAnalyticsRepository,
  PostgresReflectionRepository,
  PostgresCoachDashboardProjectionRepository,
  PostgresMotivationProfileRepository,
  PostgresCoachingSessionRepository,
  PostgresCoachingPlanRepository,
  PostgresDailyStudyPlanRepository,
  PostgresRevisionPlanRepository,
  PostgresConversationRepository,
  PostgresInsightRepository,
  PostgresNotificationRepository
} from '@clasptek/persistence';
import {
  CreateCoachHandler,
  StartCoachingSessionHandler,
  EndCoachingSessionHandler,
  GenerateStudyPlanHandler,
  GenerateRevisionPlanHandler,
  GenerateWeeklyPlanHandler,
  CreateGoalHandler,
  UpdateGoalProgressHandler,
  CompleteGoalHandler,
  UpdateHabitHandler,
  RecordReflectionHandler,
  GenerateMotivationHandler,
  ArchiveConversationHandler,
  GenerateInsightHandler,
  ComputeHabitAnalyticsHandler,
  GetCoachHandler,
  GetTodaysTasksHandler,
  GetCurrentPlanHandler,
  GetGoalsHandler,
  GetStudyHistoryHandler,
  GetConversationHistoryHandler,
  GetHabitSummaryHandler,
  GetReflectionHistoryHandler,
  GetCoachDashboardHandler,
  RuleBasedStudyPlanningEngine,
  RuleBasedMotivationEngine
} from '@clasptek/application-learning-coach';

export interface LearningCoachContext {
  // Commands
  createCoach: CreateCoachHandler;
  startCoachingSession: StartCoachingSessionHandler;
  endCoachingSession: EndCoachingSessionHandler;
  generateStudyPlan: GenerateStudyPlanHandler;
  generateRevisionPlan: GenerateRevisionPlanHandler;
  generateWeeklyPlan: GenerateWeeklyPlanHandler;
  createGoal: CreateGoalHandler;
  updateGoalProgress: UpdateGoalProgressHandler;
  completeGoal: CompleteGoalHandler;
  updateHabit: UpdateHabitHandler;
  recordReflection: RecordReflectionHandler;
  generateMotivation: GenerateMotivationHandler;
  archiveConversation: ArchiveConversationHandler;
  generateInsight: GenerateInsightHandler;
  computeHabitAnalytics: ComputeHabitAnalyticsHandler;

  // Queries
  getCoach: GetCoachHandler;
  getTodaysTasks: GetTodaysTasksHandler;
  getCurrentPlan: GetCurrentPlanHandler;
  getGoals: GetGoalsHandler;
  getStudyHistory: GetStudyHistoryHandler;
  getConversationHistory: GetConversationHistoryHandler;
  getHabitSummary: GetHabitSummaryHandler;
  getReflectionHistory: GetReflectionHistoryHandler;
  getCoachDashboard: GetCoachDashboardHandler;
}

let cached: LearningCoachContext | null = null;

export async function getLearningCoachContext(): Promise<LearningCoachContext> {
  if (cached) return cached;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('learning-coach-context');
  const dbPool = new DatabasePool(env, logger);

  await dbPool.connect();

  const coachRepo = new PostgresLearningCoachRepository(dbPool);
  const brainRepo = new PostgresCoachBrainRepository(dbPool);
  const memoryRepo = new PostgresCoachMemoryRepository(dbPool);
  const sessionRepo = new PostgresCoachingSessionRepository(dbPool);
  const planRepo = new PostgresCoachingPlanRepository(dbPool);
  const dailyPlanRepo = new PostgresDailyStudyPlanRepository(dbPool);
  const revisionPlanRepo = new PostgresRevisionPlanRepository(dbPool);
  const goalRepo = new PostgresGoalRepository(dbPool);
  const conversationRepo = new PostgresConversationRepository(dbPool);
  const habitRepo = new PostgresHabitRepository(dbPool);
  const analyticsRepo = new PostgresHabitAnalyticsRepository(dbPool);
  const reflectionRepo = new PostgresReflectionRepository(dbPool);
  const insightRepo = new PostgresInsightRepository(dbPool);
  const notificationRepo = new PostgresNotificationRepository(dbPool);
  const dashboardRepo = new PostgresCoachDashboardProjectionRepository(dbPool);
  const profileRepo = new PostgresMotivationProfileRepository(dbPool);

  const studyPlanningEngine = new RuleBasedStudyPlanningEngine();
  const motivationEngine = new RuleBasedMotivationEngine();

  cached = {
    createCoach: new CreateCoachHandler(coachRepo, brainRepo, memoryRepo, profileRepo),
    startCoachingSession: new StartCoachingSessionHandler(sessionRepo),
    endCoachingSession: new EndCoachingSessionHandler(sessionRepo),
    generateStudyPlan: new GenerateStudyPlanHandler(dailyPlanRepo, coachRepo, brainRepo, memoryRepo, studyPlanningEngine),
    generateRevisionPlan: new GenerateRevisionPlanHandler(revisionPlanRepo),
    generateWeeklyPlan: new GenerateWeeklyPlanHandler(planRepo, studyPlanningEngine),
    createGoal: new CreateGoalHandler(goalRepo),
    updateGoalProgress: new UpdateGoalProgressHandler(goalRepo),
    completeGoal: new CompleteGoalHandler(goalRepo),
    updateHabit: new UpdateHabitHandler(habitRepo),
    recordReflection: new RecordReflectionHandler(reflectionRepo),
    generateMotivation: new GenerateMotivationHandler(motivationEngine, notificationRepo),
    archiveConversation: new ArchiveConversationHandler(conversationRepo),
    generateInsight: new GenerateInsightHandler(insightRepo),
    computeHabitAnalytics: new ComputeHabitAnalyticsHandler(habitRepo, analyticsRepo),

    getCoach: new GetCoachHandler(coachRepo, brainRepo, memoryRepo),
    getTodaysTasks: new GetTodaysTasksHandler(dailyPlanRepo),
    getCurrentPlan: new GetCurrentPlanHandler(planRepo),
    getGoals: new GetGoalsHandler(goalRepo),
    getStudyHistory: new GetStudyHistoryHandler(planRepo),
    getConversationHistory: new GetConversationHistoryHandler(conversationRepo),
    getHabitSummary: new GetHabitSummaryHandler(analyticsRepo),
    getReflectionHistory: new GetReflectionHistoryHandler(reflectionRepo),
    getCoachDashboard: new GetCoachDashboardHandler(dashboardRepo, dailyPlanRepo, goalRepo, analyticsRepo, insightRepo)
  };

  return cached;
}
