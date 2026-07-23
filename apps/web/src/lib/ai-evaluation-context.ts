import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresEvaluationRepository,
  PostgresHumanReviewRepository,
  PostgresPromptRepository,
  PostgresEvaluationProfileRepository,
  PostgresPromptExperimentRepository,
  PostgresPromptComparisonRepository,
  PostgresPromptPerformanceRepository,
  PostgresBenchmarkDatasetRepository,
  PostgresBenchmarkRunRepository,
  PostgresBenchmarkResultRepository,
  PostgresBenchmarkRegressionRepository,
  PostgresDeploymentDecisionRepository,
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
  RegisterPromptVersionHandler,
  ComparePromptVersionsHandler,
  RunBenchmarkHandler,
  DetectRegressionHandler,
  ApproveDeploymentHandler,
  GetPromptPerformanceHandler,
  GetPromptComparisonHandler,
  GetBenchmarkRunsHandler,
  GetBenchmarkResultsHandler,
  GetRegressionHistoryHandler,
  GetDeploymentDecisionHandler,
} from '@clasptek/application-ai-evaluation';
import {
  PromptComparisonEngine,
  BenchmarkEngine,
  RegressionDetectionEngine,
  DeploymentDecisionEngine,
  MockAIProvider,
} from '@clasptek/domain-ai-evaluation';

export interface AiEvaluationContext {
  // Commands
  queueEvaluation: QueueEvaluationHandler;
  runEvaluation: RunEvaluationHandler;
  requestReview: RequestHumanReviewHandler;
  approveEvaluation: ApproveEvaluationHandler;
  publishEvaluation: PublishEvaluationHandler;
  overrideScore: OverrideScoreHandler;
  registerPromptVersion: RegisterPromptVersionHandler;
  comparePromptVersions: ComparePromptVersionsHandler;
  runBenchmark: RunBenchmarkHandler;
  detectRegression: DetectRegressionHandler;
  approveDeployment: ApproveDeploymentHandler;
  // Queries
  getEvaluation: GetEvaluationHandler;
  getFeedback: GetFeedbackHandler;
  getConfidence: GetConfidenceHandler;
  searchEvaluations: SearchEvaluationsHandler;
  getPromptPerformance: GetPromptPerformanceHandler;
  getPromptComparison: GetPromptComparisonHandler;
  getBenchmarkRuns: GetBenchmarkRunsHandler;
  getBenchmarkResults: GetBenchmarkResultsHandler;
  getRegressionHistory: GetRegressionHistoryHandler;
  getDeploymentDecision: GetDeploymentDecisionHandler;
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

  const experimentRepo = new PostgresPromptExperimentRepository(dbPool);
  const comparisonRepo = new PostgresPromptComparisonRepository(dbPool);
  const performanceRepo = new PostgresPromptPerformanceRepository(dbPool);
  const datasetRepo = new PostgresBenchmarkDatasetRepository(dbPool);
  const runRepo = new PostgresBenchmarkRunRepository(dbPool);
  const resultRepo = new PostgresBenchmarkResultRepository(dbPool);
  const regressionRepo = new PostgresBenchmarkRegressionRepository(dbPool);
  const decisionRepo = new PostgresDeploymentDecisionRepository(dbPool);

  const comparisonEngine = new PromptComparisonEngine();
  const provider = new MockAIProvider();
  const benchmarkEngine = new BenchmarkEngine(provider);
  const regressionEngine = new RegressionDetectionEngine();
  const decisionEngine = new DeploymentDecisionEngine();

  cached = {
    // Commands
    queueEvaluation: new QueueEvaluationHandler(evaluationRepo, profileRepo),
    runEvaluation: new RunEvaluationHandler(evaluationRepo, profileRepo, promptRepo),
    requestReview: new RequestHumanReviewHandler(evaluationRepo, reviewRepo),
    approveEvaluation: new ApproveEvaluationHandler(evaluationRepo, reviewRepo),
    publishEvaluation: new PublishEvaluationHandler(evaluationRepo, reviewRepo),
    overrideScore: new OverrideScoreHandler(reviewRepo),
    registerPromptVersion: new RegisterPromptVersionHandler(datasetRepo),
    comparePromptVersions: new ComparePromptVersionsHandler(
      experimentRepo,
      comparisonRepo,
      performanceRepo,
      comparisonEngine
    ),
    runBenchmark: new RunBenchmarkHandler(datasetRepo, runRepo, resultRepo, benchmarkEngine),
    detectRegression: new DetectRegressionHandler(runRepo, regressionRepo, regressionEngine),
    approveDeployment: new ApproveDeploymentHandler(
      runRepo,
      regressionRepo,
      decisionRepo,
      decisionEngine
    ),
    // Queries
    getEvaluation: new GetEvaluationHandler(evaluationRepo),
    getFeedback: new GetFeedbackHandler(evaluationRepo),
    getConfidence: new GetConfidenceHandler(evaluationRepo),
    searchEvaluations: new SearchEvaluationsHandler(evaluationRepo),
    getPromptPerformance: new GetPromptPerformanceHandler(performanceRepo),
    getPromptComparison: new GetPromptComparisonHandler(comparisonRepo),
    getBenchmarkRuns: new GetBenchmarkRunsHandler(runRepo),
    getBenchmarkResults: new GetBenchmarkResultsHandler(resultRepo),
    getRegressionHistory: new GetRegressionHistoryHandler(regressionRepo),
    getDeploymentDecision: new GetDeploymentDecisionHandler(decisionRepo),
  };

  return cached;
}
