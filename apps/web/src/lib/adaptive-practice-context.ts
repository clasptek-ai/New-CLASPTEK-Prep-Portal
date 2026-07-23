import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresPracticeSessionRepository,
  PostgresPracticePlanRepository,
  PostgresRecommendationRepository,
  PostgresPracticeGoalRepository,
  PostgresRetentionRepository,
  PostgresDailyGoalRepository,
  PostgresMotivationRepository,
  PostgresPracticeAnalyticsRepository,
} from '@clasptek/persistence';
import {
  CreatePracticePlanHandler,
  StartPracticeSessionHandler,
  PausePracticeSessionHandler,
  ResumePracticeSessionHandler,
  CompletePracticeSessionHandler,
  GenerateRecommendationsHandler,
  AcceptRecommendationHandler,
  RejectRecommendationHandler,
  GetPracticeSessionHandler,
  GetPracticePlanHandler,
  GetPracticeHistoryHandler,
  SearchRecommendationsHandler,
  SetPracticeGoalHandler,
  GetPracticeGoalQueryHandler,
  UpdateRetentionHandler,
  GetRetentionQueryHandler,
  RecordResponseConfidenceHandler,
  GenerateDailyGoalHandler,
  GetDailyGoalQueryHandler,
  AwardMotivationPointsHandler,
  GetMotivationQueryHandler,
  GetPracticeAnalyticsQueryHandler,
  GetFocusAreaRecommendationsQueryHandler,
} from '@clasptek/application-adaptive-practice';

export interface AdaptivePracticeContext {
  // Commands
  createPlan: CreatePracticePlanHandler;
  startSession: StartPracticeSessionHandler;
  pauseSession: PausePracticeSessionHandler;
  resumeSession: ResumePracticeSessionHandler;
  completeSession: CompletePracticeSessionHandler;
  generateRecommendations: GenerateRecommendationsHandler;
  acceptRecommendation: AcceptRecommendationHandler;
  rejectRecommendation: RejectRecommendationHandler;
  setGoal: SetPracticeGoalHandler;
  updateRetention: UpdateRetentionHandler;
  recordConfidence: RecordResponseConfidenceHandler;
  generateDailyGoal: GenerateDailyGoalHandler;
  awardMotivation: AwardMotivationPointsHandler;
  // Queries
  getSession: GetPracticeSessionHandler;
  getPlan: GetPracticePlanHandler;
  getHistory: GetPracticeHistoryHandler;
  searchRecommendations: SearchRecommendationsHandler;
  getGoals: GetPracticeGoalQueryHandler;
  getRetention: GetRetentionQueryHandler;
  getDailyGoal: GetDailyGoalQueryHandler;
  getMotivation: GetMotivationQueryHandler;
  getAnalytics: GetPracticeAnalyticsQueryHandler;
  getFocusAreas: GetFocusAreaRecommendationsQueryHandler;
}

let cached: AdaptivePracticeContext | null = null;

export function getAdaptivePracticeContext(): AdaptivePracticeContext {
  if (cached) return cached;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('adaptive-practice-context');
  const dbPool = new DatabasePool(env, logger);

  const sessionRepo = new PostgresPracticeSessionRepository(dbPool);
  const planRepo = new PostgresPracticePlanRepository(dbPool);
  const recommendationRepo = new PostgresRecommendationRepository(dbPool);
  const goalRepo = new PostgresPracticeGoalRepository(dbPool);
  const retentionRepo = new PostgresRetentionRepository(dbPool);
  const dailyGoalRepo = new PostgresDailyGoalRepository(dbPool);
  const motivationRepo = new PostgresMotivationRepository(dbPool);
  const analyticsRepo = new PostgresPracticeAnalyticsRepository(dbPool);

  cached = {
    // Commands
    createPlan: new CreatePracticePlanHandler(planRepo),
    startSession: new StartPracticeSessionHandler(sessionRepo),
    pauseSession: new PausePracticeSessionHandler(sessionRepo),
    resumeSession: new ResumePracticeSessionHandler(sessionRepo),
    completeSession: new CompletePracticeSessionHandler(sessionRepo),
    generateRecommendations: new GenerateRecommendationsHandler(recommendationRepo),
    acceptRecommendation: new AcceptRecommendationHandler(recommendationRepo),
    rejectRecommendation: new RejectRecommendationHandler(recommendationRepo),
    setGoal: new SetPracticeGoalHandler(goalRepo),
    updateRetention: new UpdateRetentionHandler(retentionRepo),
    recordConfidence: new RecordResponseConfidenceHandler(sessionRepo),
    generateDailyGoal: new GenerateDailyGoalHandler(dailyGoalRepo),
    awardMotivation: new AwardMotivationPointsHandler(motivationRepo),
    // Queries
    getSession: new GetPracticeSessionHandler(sessionRepo),
    getPlan: new GetPracticePlanHandler(planRepo),
    getHistory: new GetPracticeHistoryHandler(sessionRepo),
    searchRecommendations: new SearchRecommendationsHandler(recommendationRepo),
    getGoals: new GetPracticeGoalQueryHandler(goalRepo),
    getRetention: new GetRetentionQueryHandler(retentionRepo),
    getDailyGoal: new GetDailyGoalQueryHandler(dailyGoalRepo),
    getMotivation: new GetMotivationQueryHandler(motivationRepo),
    getAnalytics: new GetPracticeAnalyticsQueryHandler(analyticsRepo),
    getFocusAreas: new GetFocusAreaRecommendationsQueryHandler(),
  };

  return cached;
}
