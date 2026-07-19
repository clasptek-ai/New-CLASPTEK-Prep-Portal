import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresPracticeSessionRepository,
  PostgresPracticePlanRepository,
  PostgresRecommendationRepository,
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
  // Queries
  getSession: GetPracticeSessionHandler;
  getPlan: GetPracticePlanHandler;
  getHistory: GetPracticeHistoryHandler;
  searchRecommendations: SearchRecommendationsHandler;
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
    // Queries
    getSession: new GetPracticeSessionHandler(sessionRepo),
    getPlan: new GetPracticePlanHandler(planRepo),
    getHistory: new GetPracticeHistoryHandler(sessionRepo),
    searchRecommendations: new SearchRecommendationsHandler(recommendationRepo),
  };

  return cached;
}
