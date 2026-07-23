import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresReadinessPredictionRepository,
  PostgresReadinessSnapshotRepository,
  PostgresPredictionExperimentRepository,
  PostgresModelVersionRepository,
  PostgresPredictionFeatureCatalogueRepository,
  PostgresPredictionOutcomeRepository,
  PostgresPredictionInterventionCatalogueRepository,
  PostgresLearningVelocitySnapshotRepository,
  PostgresPredictionLifecycleMetricsRepository,
  PostgresReadinessTimelineRepository,
  PostgresReadinessStateSnapshotRepository,
  PostgresPredictionStabilityRepository,
  PostgresScenarioRepository,
  PostgresBenchmarkRepository,
} from '@clasptek/persistence';
import {
  GeneratePredictionHandler,
  PublishPredictionHandler,
  CreateExperimentHandler,
  StartExperimentHandler,
  CompleteExperimentHandler,
  TriggerInterventionHandler,
  CompleteInterventionHandler,
  DiscardInterventionHandler,
  RecordPredictionOutcomeHandler,
  RegisterFeatureInCatalogueHandler,
  GetFeatureCatalogueHandler,
  GetInterventionCatalogueHandler,
  GetLifecycleMetricsHandler,
  CalculatePredictionLifecycleMetricsHandler,
  GetLearningVelocityHistoryHandler,
  GetPredictionLifecycleMetricsHandler,
  GetLatestPredictionHandler,
  GetPredictionHistoryHandler,
  GetActiveExperimentHandler,
  SearchPredictionsHandler,
  RecordReadinessSnapshotHandler,
  UpdatePredictionStabilityHandler,
  GenerateScenarioHandler,
  CalculateBenchmarksHandler,
  GetTimelineHandler,
  GetPredictionStabilityHandler,
  GetSkillContributionHandler,
  GetScenarioProjectionHandler,
  GetBenchmarkHandler,
  ReadinessAnalyticsOrchestrator,
  ScenarioPlanningOrchestrator,
  InstitutionalBenchmarkOrchestrator,
} from '@clasptek/application-prediction-engine';

export interface PredictionEngineContext {
  // Commands
  generatePrediction: GeneratePredictionHandler;
  publishPrediction: PublishPredictionHandler;
  createExperiment: CreateExperimentHandler;
  startExperiment: StartExperimentHandler;
  completeExperiment: CompleteExperimentHandler;
  triggerIntervention: TriggerInterventionHandler;
  completeIntervention: CompleteInterventionHandler;
  discardIntervention: DiscardInterventionHandler;
  recordPredictionOutcome: RecordPredictionOutcomeHandler;
  registerFeatureInCatalogue: RegisterFeatureInCatalogueHandler;
  calculatePredictionLifecycleMetrics: CalculatePredictionLifecycleMetricsHandler;
  recordReadinessSnapshot: RecordReadinessSnapshotHandler;
  updatePredictionStability: UpdatePredictionStabilityHandler;
  generateScenario: GenerateScenarioHandler;
  calculateBenchmarks: CalculateBenchmarksHandler;
  // Queries
  getLatestPrediction: GetLatestPredictionHandler;
  getPredictionHistory: GetPredictionHistoryHandler;
  getActiveExperiment: GetActiveExperimentHandler;
  searchPredictions: SearchPredictionsHandler;
  getFeatureCatalogue: GetFeatureCatalogueHandler;
  getInterventionCatalogue: GetInterventionCatalogueHandler;
  getLifecycleMetrics: GetLifecycleMetricsHandler;
  getLearningVelocityHistory: GetLearningVelocityHistoryHandler;
  getPredictionLifecycleMetrics: GetPredictionLifecycleMetricsHandler;
  getTimeline: GetTimelineHandler;
  getPredictionStability: GetPredictionStabilityHandler;
  getSkillContribution: GetSkillContributionHandler;
  getScenarioProjection: GetScenarioProjectionHandler;
  getBenchmark: GetBenchmarkHandler;
  // Orchestrators
  timelineOrchestrator: ReadinessAnalyticsOrchestrator;
  scenarioOrchestrator: ScenarioPlanningOrchestrator;
  benchmarkOrchestrator: InstitutionalBenchmarkOrchestrator;
}

let cached: PredictionEngineContext | null = null;

export async function getPredictionEngineContext(): Promise<PredictionEngineContext> {
  if (cached) return cached;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('prediction-engine-context');
  const dbPool = new DatabasePool(env, logger);

  await dbPool.connect();

  const predictionRepo = new PostgresReadinessPredictionRepository(dbPool);
  const snapshotRepo = new PostgresReadinessSnapshotRepository(dbPool);
  const experimentRepo = new PostgresPredictionExperimentRepository(dbPool);
  const modelVersionRepo = new PostgresModelVersionRepository(dbPool);
  const featureCatalogueRepo = new PostgresPredictionFeatureCatalogueRepository(dbPool);
  const outcomeRepo = new PostgresPredictionOutcomeRepository(dbPool);
  const interventionCatalogueRepo = new PostgresPredictionInterventionCatalogueRepository(dbPool);
  const velocityRepo = new PostgresLearningVelocitySnapshotRepository(dbPool);
  const metricsRepo = new PostgresPredictionLifecycleMetricsRepository(dbPool);

  const timelineRepo = new PostgresReadinessTimelineRepository(dbPool);
  const stateSnapshotRepo = new PostgresReadinessStateSnapshotRepository(dbPool);
  const stabilityRepo = new PostgresPredictionStabilityRepository(dbPool);
  const scenarioRepo = new PostgresScenarioRepository(dbPool);
  const benchmarkRepo = new PostgresBenchmarkRepository(dbPool);

  cached = {
    generatePrediction: new GeneratePredictionHandler(
      predictionRepo,
      snapshotRepo,
      experimentRepo,
      modelVersionRepo,
      velocityRepo
    ),
    publishPrediction: new PublishPredictionHandler(predictionRepo),
    createExperiment: new CreateExperimentHandler(experimentRepo),
    startExperiment: new StartExperimentHandler(experimentRepo),
    completeExperiment: new CompleteExperimentHandler(experimentRepo),
    triggerIntervention: new TriggerInterventionHandler(predictionRepo),
    completeIntervention: new CompleteInterventionHandler(predictionRepo),
    discardIntervention: new DiscardInterventionHandler(predictionRepo),
    recordPredictionOutcome: new RecordPredictionOutcomeHandler(outcomeRepo, predictionRepo),
    registerFeatureInCatalogue: new RegisterFeatureInCatalogueHandler(featureCatalogueRepo),
    calculatePredictionLifecycleMetrics: new CalculatePredictionLifecycleMetricsHandler(
      metricsRepo
    ),
    recordReadinessSnapshot: new RecordReadinessSnapshotHandler(timelineRepo, stateSnapshotRepo),
    updatePredictionStability: new UpdatePredictionStabilityHandler(stabilityRepo),
    generateScenario: new GenerateScenarioHandler(scenarioRepo),
    calculateBenchmarks: new CalculateBenchmarksHandler(benchmarkRepo),
    getLatestPrediction: new GetLatestPredictionHandler(predictionRepo),
    getPredictionHistory: new GetPredictionHistoryHandler(predictionRepo),
    getActiveExperiment: new GetActiveExperimentHandler(experimentRepo),
    searchPredictions: new SearchPredictionsHandler(predictionRepo),
    getFeatureCatalogue: new GetFeatureCatalogueHandler(featureCatalogueRepo),
    getInterventionCatalogue: new GetInterventionCatalogueHandler(interventionCatalogueRepo),
    getLifecycleMetrics: new GetLifecycleMetricsHandler(outcomeRepo, predictionRepo),
    getLearningVelocityHistory: new GetLearningVelocityHistoryHandler(velocityRepo),
    getPredictionLifecycleMetrics: new GetPredictionLifecycleMetricsHandler(metricsRepo),
    getTimeline: new GetTimelineHandler(timelineRepo, stateSnapshotRepo),
    getPredictionStability: new GetPredictionStabilityHandler(stabilityRepo),
    getSkillContribution: new GetSkillContributionHandler(stateSnapshotRepo),
    getScenarioProjection: new GetScenarioProjectionHandler(scenarioRepo),
    getBenchmark: new GetBenchmarkHandler(benchmarkRepo),
    timelineOrchestrator: new ReadinessAnalyticsOrchestrator(timelineRepo, stateSnapshotRepo),
    scenarioOrchestrator: new ScenarioPlanningOrchestrator(scenarioRepo),
    benchmarkOrchestrator: new InstitutionalBenchmarkOrchestrator(benchmarkRepo),
  };

  return cached;
}
