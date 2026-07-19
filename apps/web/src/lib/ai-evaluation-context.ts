import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresEvaluationRepository,
  PostgresHumanReviewRepository,
  PostgresPromptRepository,
  PostgresEvaluationProfileRepository,
} from '@clasptek/persistence';
import {
  QueueEvaluationHandler,
  RunEvaluationHandler,
  RequestHumanReviewHandler,
  ApproveEvaluationHandler,
  PublishEvaluationHandler,
  OverrideScoreHandler,
  GetEvaluationHandler,
  GetFeedbackHandler,
  GetConfidenceHandler,
  SearchEvaluationsHandler,
} from '@clasptek/application-ai-evaluation';

export interface AiEvaluationContext {
  // Commands
  queueEvaluation: QueueEvaluationHandler;
  runEvaluation: RunEvaluationHandler;
  requestReview: RequestHumanReviewHandler;
  approveEvaluation: ApproveEvaluationHandler;
  publishEvaluation: PublishEvaluationHandler;
  overrideScore: OverrideScoreHandler;
  // Queries
  getEvaluation: GetEvaluationHandler;
  getFeedback: GetFeedbackHandler;
  getConfidence: GetConfidenceHandler;
  searchEvaluations: SearchEvaluationsHandler;
}

let cached: AiEvaluationContext | null = null;

export function getAiEvaluationContext(): AiEvaluationContext {
  if (cached) return cached;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('ai-evaluation-context');
  const dbPool = new DatabasePool(env, logger);

  const evaluationRepo = new PostgresEvaluationRepository(dbPool);
  const reviewRepo = new PostgresHumanReviewRepository(dbPool);
  const promptRepo = new PostgresPromptRepository(dbPool);
  const profileRepo = new PostgresEvaluationProfileRepository(dbPool);

  cached = {
    // Commands
    queueEvaluation: new QueueEvaluationHandler(evaluationRepo, profileRepo),
    runEvaluation: new RunEvaluationHandler(evaluationRepo, profileRepo, promptRepo),
    requestReview: new RequestHumanReviewHandler(evaluationRepo, reviewRepo),
    approveEvaluation: new ApproveEvaluationHandler(evaluationRepo, reviewRepo),
    publishEvaluation: new PublishEvaluationHandler(evaluationRepo, reviewRepo),
    overrideScore: new OverrideScoreHandler(reviewRepo),
    // Queries
    getEvaluation: new GetEvaluationHandler(evaluationRepo),
    getFeedback: new GetFeedbackHandler(evaluationRepo),
    getConfidence: new GetConfidenceHandler(evaluationRepo),
    searchEvaluations: new SearchEvaluationsHandler(evaluationRepo),
  };

  return cached;
}
