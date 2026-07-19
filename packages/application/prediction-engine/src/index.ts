import {
  ReadinessPrediction,
  ReadinessSnapshot,
  PredictionExperiment,
  PredictionFeatureSet,
  PredictionExplanation,
  PredictionEvidence,
  PredictionTrend,
  PredictionIntervention,
  PredictionRecommendation,
  ReadinessScore,
  ModelConfiguration,
  PredictionStrategyRegistry,
  PredictionFeatureCatalogueEntry,
  PredictionOutcome,
  PredictionInterventionCatalogueEntry,
  LearningVelocitySnapshot,
  PredictionLifecycleMetrics,
  PredictionModel
} from '@clasptek/domain-prediction-engine';
import { randomUUID } from 'crypto';

// ═══════════════════════════════════════════════════════════════════
// 1. REPOSITORY CONTRACTS
// ═══════════════════════════════════════════════════════════════════

export interface PredictionSearchFilters {
  studentId?: string | undefined;
  profileId?: string | undefined;
  status?: 'DRAFT' | 'PUBLISHED' | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface ReadinessPredictionRepository {
  save(prediction: ReadinessPrediction, latencyMs?: number): Promise<void>;
  findById(id: string): Promise<ReadinessPrediction | null>;
  findLatestByStudent(studentId: string, profileId: string): Promise<ReadinessPrediction | null>;
  findHistoryByStudent(studentId: string, profileId: string, limit?: number): Promise<ReadinessPrediction[]>;
  search(filters: PredictionSearchFilters): Promise<ReadinessPrediction[]>;
}

export interface ReadinessSnapshotRepository {
  save(snapshot: ReadinessSnapshot): Promise<void>;
  findById(id: string): Promise<ReadinessSnapshot | null>;
  findLatestByStudent(studentId: string): Promise<ReadinessSnapshot | null>;
}

export interface PredictionExperimentRepository {
  save(experiment: PredictionExperiment): Promise<void>;
  findById(id: string): Promise<PredictionExperiment | null>;
  findActiveExperiment(): Promise<PredictionExperiment | null>;
  findByCode(code: string): Promise<PredictionExperiment | null>;
}

export interface PredictionFeatureRepository {
  findByCode(code: string): Promise<any | null>;
  findAllActive(): Promise<any[]>;
}

export interface ModelVersionRepository {
  findById(id: string): Promise<any | null>;
  findCurrentByModelCode(modelCode: string): Promise<any | null>;
}

export interface PredictionModelRepository {
  save(model: PredictionModel): Promise<void>;
  findById(id: string): Promise<PredictionModel | null>;
  findByCode(code: string): Promise<PredictionModel | null>;
}

export interface PredictionOutcomeRepository {
  save(outcome: PredictionOutcome): Promise<void>;
  findById(id: string): Promise<PredictionOutcome | null>;
  findByPredictionId(predictionId: string): Promise<PredictionOutcome | null>;
}

export interface LearningVelocityRepository {
  save(snapshot: LearningVelocitySnapshot): Promise<void>;
  findHistoryByStudent(studentId: string, limit?: number): Promise<LearningVelocitySnapshot[]>;
}

export interface PredictionLifecycleMetricsRepository {
  save(metrics: PredictionLifecycleMetrics): Promise<void>;
  findLatestByModelVersion(modelVersionId: string): Promise<PredictionLifecycleMetrics | null>;
  calculateMetrics(modelVersionId: string): Promise<PredictionLifecycleMetrics>;
}

export interface PredictionFeatureCatalogueRepository {
  save(entry: PredictionFeatureCatalogueEntry): Promise<void>;
  findByCode(code: string): Promise<PredictionFeatureCatalogueEntry | null>;
  findAll(): Promise<PredictionFeatureCatalogueEntry[]>;
}

export interface PredictionOutcomeRepository {
  save(outcome: PredictionOutcome): Promise<void>;
  findById(id: string): Promise<PredictionOutcome | null>;
  findByPredictionId(predictionId: string): Promise<PredictionOutcome | null>;
  findAll(): Promise<PredictionOutcome[]>;
}

export interface PredictionInterventionCatalogueRepository {
  save(entry: PredictionInterventionCatalogueEntry): Promise<void>;
  findByType(type: string): Promise<PredictionInterventionCatalogueEntry | null>;
  findAll(): Promise<PredictionInterventionCatalogueEntry[]>;
}

export interface LearningVelocitySnapshotRepository {
  save(snapshot: LearningVelocitySnapshot): Promise<void>;
  findLatestByStudent(studentId: string): Promise<LearningVelocitySnapshot | null>;
  findHistoryByStudent(studentId: string, limit?: number): Promise<LearningVelocitySnapshot[]>;
}

// ═══════════════════════════════════════════════════════════════════
// 2. COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class GeneratePredictionHandler {
  constructor(
    private readonly predictionRepo: ReadinessPredictionRepository,
    private readonly snapshotRepo: ReadinessSnapshotRepository,
    private readonly experimentRepo: PredictionExperimentRepository,
    private readonly modelVersionRepo: ModelVersionRepository,
    private readonly velocityRepo?: LearningVelocityRepository
  ) {}

  public async execute(cmd: {
    studentId: string;
    profileId: string; // references IELTS_ACADEMIC, etc.
    learnerState: Record<string, any>;
    latestEvaluationSummaries: Record<string, any>;
    practiceStatistics: Record<string, any>;
    studyStreak: Record<string, any>;
    competencyMastery: Record<string, any>;
    forecastWindow: string;
    profileCode: string;
  }): Promise<{ predictionId: string; snapshotId: string; modelVersionId: string }> {
    const startTime = Date.now();

    // 1. Resolve model version (Check experiment traffic split first)
    let modelVersionId = 'b0000000-0000-0000-0000-000000000101'; // Default Bayesian
    let algorithmType = 'BAYESIAN';
    let mockConfig: Record<string, any> = { p_init: 0.5, p_transit: 0.1, p_slip: 0.1, p_guess: 0.2 };

    const activeExperiment = await this.experimentRepo.findActiveExperiment();
    if (activeExperiment && activeExperiment.status === 'RUNNING') {
      const roll = Math.random() * 100;
      if (roll >= activeExperiment.trafficSplitPercentage) {
        modelVersionId = activeExperiment.challengerModelVersionId;
      } else {
        modelVersionId = activeExperiment.controlModelVersionId;
      }
    } else {
      // Find current version of active model based on profileCode
      // We fall back to specific algorithms depending on the profile
      if (cmd.profileCode.includes('IELTS')) {
        algorithmType = 'WEIGHTED_RUBRIC';
        modelVersionId = 'b0000000-0000-0000-0000-000000000104';
        mockConfig = { weights: { writing: 0.4, speaking: 0.3, listening: 0.15, reading: 0.15 } };
      } else if (cmd.profileCode.includes('TOEFL')) {
        algorithmType = 'REGRESSION';
        modelVersionId = 'b0000000-0000-0000-0000-000000000102';
        mockConfig = { weights: { velocity: 0.3, accuracy: 0.5, momentum: 0.2 } };
      } else if (cmd.profileCode.includes('MOCK')) {
        algorithmType = 'MOCK';
        modelVersionId = 'b0000000-0000-0000-0000-000000000105';
        mockConfig = { mock_score: 75.0, mock_confidence: 0.90 };
      }
    }

    // 2. Fetch specific model configurations if in persistence
    const modelVersion = await this.modelVersionRepo.findById(modelVersionId);
    let configuration = mockConfig;
    if (modelVersion) {
      configuration = modelVersion.configuration ?? mockConfig;
      // Resolve algorithm type from parent model if available
      algorithmType = modelVersion.algorithmType ?? algorithmType;
    }

    // 3. Create ReadinessSnapshot aggregate (Recommendation 1)
    const snapshot = ReadinessSnapshot.create({
      studentId: cmd.studentId,
      learnerState: cmd.learnerState,
      latestEvaluationSummaries: cmd.latestEvaluationSummaries,
      practiceStatistics: cmd.practiceStatistics,
      studyStreak: cmd.studyStreak,
      competencyMastery: cmd.competencyMastery,
      forecastWindow: cmd.forecastWindow,
      modelVersionId
    });

    // 4. Resolve Strategy Engine from Registry (Recommendation 2)
    const engine = PredictionStrategyRegistry.instance.get(algorithmType);
    const modelConfig = new ModelConfiguration(configuration);

    // 5. Calculate prediction using the active strategy
    const result = await engine.predict(snapshot, modelConfig);
    const latencyMs = Date.now() - startTime;

    // 6. Map results to value objects and entities
    const overallScore = new ReadinessScore(result.overallScore, cmd.profileCode.includes('IELTS') ? 'band' : 'percentage');
    const confidence = result.confidence;

    const featureSet = new PredictionFeatureSet({
      id: randomUUID(),
      features: result.features
    });

    const explanation = new PredictionExplanation({
      id: randomUUID(),
      contributingFactors: result.explanation.contributingFactors,
      featureImportance: result.explanation.featureImportance,
      confidenceExplanation: result.explanation.confidenceExplanation,
      evidenceReferences: result.explanation.evidenceReferences,
      featureContributionRanking: result.explanation.featureContributionRanking,
      predictionCertainty: result.explanation.predictionCertainty,
      topInfluencingCompetencies: result.explanation.topInfluencingCompetencies,
      strongestRiskIndicators: result.explanation.strongestRiskIndicators
    });

    const evidence = result.evidence.map(e => new PredictionEvidence({
      id: randomUUID(),
      evidenceType: e.type,
      evidenceSourceId: e.sourceId,
      weight: e.weight,
      description: e.description
    }));

    const trends = result.trends.map(t => new PredictionTrend({
      id: randomUUID(),
      trendType: t.type,
      slope: t.slope,
      explanation: t.explanation
    }));

    const interventions = result.interventions.map(i => {
      const recommendations = i.recommendations.map(r => new PredictionRecommendation({
        id: randomUUID(),
        recommendationType: r.type,
        priority: r.priority,
        title: r.title,
        description: r.description,
        targetResourceId: r.targetResourceId,
        targetCompetencyCode: r.targetCompetencyCode,
        catalogueCode: r.catalogueCode
      }));
      return new PredictionIntervention({
        id: randomUUID(),
        studentId: cmd.studentId,
        riskLevel: i.riskLevel,
        riskScore: i.riskScore,
        triggerReason: i.triggerReason,
        status: 'PROPOSED',
        recommendations
      });
    });

    // 7. Initialize prediction aggregate and save outcomes
    const prediction = ReadinessPrediction.generate({
      studentId: cmd.studentId,
      profileId: cmd.profileId,
      modelVersionId
    });

    prediction.completePrediction(overallScore, confidence, featureSet, explanation, evidence, trends, interventions);

    await this.snapshotRepo.save(snapshot);
    await this.predictionRepo.save(prediction, latencyMs);

    // Save learning velocity snapshot to history if repo is supplied
    if (this.velocityRepo) {
      const velocityValue = cmd.practiceStatistics.velocity ?? 0.0;
      const velocitySnapshot = LearningVelocitySnapshot.create({
        studentId: cmd.studentId,
        activeHours: velocityValue,
        questionsAnswered: cmd.practiceStatistics.accuracy ? Math.round(cmd.practiceStatistics.accuracy * 10) : 0,
        accelerationRate: 0.0,
        stagnationIndicator: velocityValue < 1.0
      });
      await this.velocityRepo.save(velocitySnapshot);
    }

    return { predictionId: prediction.id, snapshotId: snapshot.id, modelVersionId };
  }
}

export class PublishPredictionHandler {
  constructor(private readonly predictionRepo: ReadinessPredictionRepository) {}

  public async execute(cmd: { predictionId: string }): Promise<void> {
    const prediction = await this.predictionRepo.findById(cmd.predictionId);
    if (!prediction) {
      throw new Error(`Prediction not found: ${cmd.predictionId}`);
    }
    prediction.publish();
    await this.predictionRepo.save(prediction);
  }
}

export class CreateExperimentHandler {
  constructor(private readonly experimentRepo: PredictionExperimentRepository) {}

  public async execute(cmd: {
    experimentCode: string;
    displayName: string;
    controlModelVersionId: string;
    challengerModelVersionId: string;
    trafficSplitPercentage: number;
  }): Promise<{ experimentId: string }> {
    const existing = await this.experimentRepo.findByCode(cmd.experimentCode);
    if (existing) {
      throw new Error(`Experiment with code '${cmd.experimentCode}' already exists`);
    }
    const experiment = PredictionExperiment.create(cmd);
    await this.experimentRepo.save(experiment);
    return { experimentId: experiment.id };
  }
}

export class StartExperimentHandler {
  constructor(private readonly experimentRepo: PredictionExperimentRepository) {}

  public async execute(cmd: { experimentId: string }): Promise<void> {
    const experiment = await this.experimentRepo.findById(cmd.experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${cmd.experimentId}`);
    }
    experiment.start();
    await this.experimentRepo.save(experiment);
  }
}

export class CompleteExperimentHandler {
  constructor(private readonly experimentRepo: PredictionExperimentRepository) {}

  public async execute(cmd: { experimentId: string }): Promise<void> {
    const experiment = await this.experimentRepo.findById(cmd.experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${cmd.experimentId}`);
    }
    experiment.complete();
    await this.experimentRepo.save(experiment);
  }
}

export class TriggerInterventionHandler {
  constructor(private readonly predictionRepo: ReadinessPredictionRepository) {}

  public async execute(cmd: { predictionId: string; interventionId: string }): Promise<void> {
    const prediction = await this.predictionRepo.findById(cmd.predictionId);
    if (!prediction) {
      throw new Error(`Prediction not found: ${cmd.predictionId}`);
    }
    const intervention = prediction.interventions.find(i => i.id === cmd.interventionId);
    if (!intervention) {
      throw new Error(`Intervention not found: ${cmd.interventionId}`);
    }
    intervention.activate();
    await this.predictionRepo.save(prediction);
  }
}

export class CompleteInterventionHandler {
  constructor(private readonly predictionRepo: ReadinessPredictionRepository) {}

  public async execute(cmd: { predictionId: string; interventionId: string }): Promise<void> {
    const prediction = await this.predictionRepo.findById(cmd.predictionId);
    if (!prediction) {
      throw new Error(`Prediction not found: ${cmd.predictionId}`);
    }
    const intervention = prediction.interventions.find(i => i.id === cmd.interventionId);
    if (!intervention) {
      throw new Error(`Intervention not found: ${cmd.interventionId}`);
    }
    intervention.complete();
    await this.predictionRepo.save(prediction);
  }
}

export class DiscardInterventionHandler {
  constructor(private readonly predictionRepo: ReadinessPredictionRepository) {}

  public async execute(cmd: { predictionId: string; interventionId: string }): Promise<void> {
    const prediction = await this.predictionRepo.findById(cmd.predictionId);
    if (!prediction) {
      throw new Error(`Prediction not found: ${cmd.predictionId}`);
    }
    const intervention = prediction.interventions.find(i => i.id === cmd.interventionId);
    if (!intervention) {
      throw new Error(`Intervention not found: ${cmd.interventionId}`);
    }
    intervention.discard();
    await this.predictionRepo.save(prediction);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. QUERY HANDLERS
// ═══════════════════════════════════════════════════════════════════

export class GetLatestPredictionHandler {
  constructor(private readonly predictionRepo: ReadinessPredictionRepository) {}

  public async execute(query: { studentId: string; profileId: string }): Promise<ReadinessPrediction | null> {
    return this.predictionRepo.findLatestByStudent(query.studentId, query.profileId);
  }
}

export class GetPredictionHistoryHandler {
  constructor(private readonly predictionRepo: ReadinessPredictionRepository) {}

  public async execute(query: { studentId: string; profileId: string; limit?: number }): Promise<ReadinessPrediction[]> {
    return this.predictionRepo.findHistoryByStudent(query.studentId, query.profileId, query.limit);
  }
}

export class GetActiveExperimentHandler {
  constructor(private readonly experimentRepo: PredictionExperimentRepository) {}

  public async execute(): Promise<PredictionExperiment | null> {
    return this.experimentRepo.findActiveExperiment();
  }
}

export class SearchPredictionsHandler {
  constructor(private readonly predictionRepo: ReadinessPredictionRepository) {}

  public async execute(query: PredictionSearchFilters): Promise<ReadinessPrediction[]> {
    return this.predictionRepo.search(query);
  }
}

export class RecordPredictionOutcomeHandler {
  constructor(
    private readonly outcomeRepo: PredictionOutcomeRepository,
    private readonly predictionRepo: ReadinessPredictionRepository
  ) {}

  public async execute(cmd: { predictionId: string; studentId: string; actualScore: number }): Promise<{ outcomeId: string }> {
    const prediction = await this.predictionRepo.findById(cmd.predictionId);
    if (!prediction) {
      throw new Error(`Prediction not found: ${cmd.predictionId}`);
    }
    if (!prediction.overallReadinessScore) {
      throw new Error(`Prediction overall score is not calculated or prediction is not completed`);
    }

    const outcome = PredictionOutcome.create({
      predictionId: cmd.predictionId,
      studentId: cmd.studentId,
      predictedScore: prediction.overallReadinessScore.value,
      actualScore: cmd.actualScore
    });

    await this.outcomeRepo.save(outcome);
    return { outcomeId: outcome.id };
  }
}

export class RegisterFeatureInCatalogueHandler {
  constructor(private readonly featureCatalogueRepo: PredictionFeatureCatalogueRepository) {}

  public async execute(cmd: {
    featureCode: string;
    displayName: string;
    sourceDomain: string;
    normalizationMethod: string;
    defaultWeight: number;
    version: string;
    description?: string;
  }): Promise<{ featureId: string }> {
    const existing = await this.featureCatalogueRepo.findByCode(cmd.featureCode);
    if (existing) {
      throw new Error(`Feature with code '${cmd.featureCode}' is already registered`);
    }

    const entry = PredictionFeatureCatalogueEntry.create({
      featureCode: cmd.featureCode,
      displayName: cmd.displayName,
      sourceDomain: cmd.sourceDomain,
      normalizationMethod: cmd.normalizationMethod,
      defaultWeight: cmd.defaultWeight,
      version: cmd.version,
      ...(cmd.description !== undefined ? { description: cmd.description } : {})
    });

    await this.featureCatalogueRepo.save(entry);
    return { featureId: entry.id };
  }
}

export class GetFeatureCatalogueHandler {
  constructor(private readonly featureCatalogueRepo: PredictionFeatureCatalogueRepository) {}

  public async execute(): Promise<PredictionFeatureCatalogueEntry[]> {
    return this.featureCatalogueRepo.findAll();
  }
}

export class GetInterventionCatalogueHandler {
  constructor(private readonly interventionCatalogueRepo: PredictionInterventionCatalogueRepository) {}

  public async execute(): Promise<PredictionInterventionCatalogueEntry[]> {
    return this.interventionCatalogueRepo.findAll();
  }
}

export class GetLifecycleMetricsHandler {
  constructor(
    private readonly outcomeRepo: PredictionOutcomeRepository,
    private readonly predictionRepo: ReadinessPredictionRepository
  ) {}

  public async execute(): Promise<{
    averageDrift: number;
    totalPredictions: number;
    totalOutcomes: number;
    accuracyMAE: number;
  }> {
    const outcomes = await this.outcomeRepo.findAll();
    let totalDrift = 0;
    let totalDelta = 0;
    for (const outcome of outcomes) {
      totalDrift += outcome.variance;
      totalDelta += outcome.calibrationDelta;
    }
    const totalOutcomes = outcomes.length;
    const averageDrift = totalOutcomes > 0 ? parseFloat((totalDrift / totalOutcomes).toFixed(2)) : 0;
    const accuracyMAE = totalOutcomes > 0 ? parseFloat((totalDelta / totalOutcomes).toFixed(2)) : 0;

    const predictions = await this.predictionRepo.search({});

    return {
      averageDrift,
      totalPredictions: predictions.length,
      totalOutcomes,
      accuracyMAE
    };
  }
}

export class CalculatePredictionLifecycleMetricsHandler {
  constructor(private readonly metricsRepo: PredictionLifecycleMetricsRepository) {}

  public async execute(cmd: { modelVersionId: string }): Promise<{ metricsId: string }> {
    const metrics = await this.metricsRepo.calculateMetrics(cmd.modelVersionId);
    await this.metricsRepo.save(metrics);
    return { metricsId: metrics.id };
  }
}

export class GetLearningVelocityHistoryHandler {
  constructor(private readonly velocityRepo: LearningVelocityRepository) {}

  public async execute(query: { studentId: string; limit?: number }): Promise<LearningVelocitySnapshot[]> {
    return this.velocityRepo.findHistoryByStudent(query.studentId, query.limit);
  }
}

export class GetPredictionLifecycleMetricsHandler {
  constructor(private readonly metricsRepo: PredictionLifecycleMetricsRepository) {}

  public async execute(query: { modelVersionId: string }): Promise<PredictionLifecycleMetrics | null> {
    return this.metricsRepo.findLatestByModelVersion(query.modelVersionId);
  }
}
