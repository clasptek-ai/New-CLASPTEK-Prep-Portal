import { describe, test, expect, vi } from 'vitest';
import {
  GeneratePredictionHandler,
  PublishPredictionHandler,
  CreateExperimentHandler,
  StartExperimentHandler,
  CompleteExperimentHandler,
  TriggerInterventionHandler,
  CompleteInterventionHandler,
  DiscardInterventionHandler,
  GetLatestPredictionHandler,
  GetPredictionHistoryHandler,
  GetActiveExperimentHandler,
  SearchPredictionsHandler,
  ReadinessPredictionRepository,
  ReadinessSnapshotRepository,
  PredictionExperimentRepository,
  ModelVersionRepository,
  PredictionFeatureCatalogueRepository,
  PredictionOutcomeRepository,
  PredictionInterventionCatalogueRepository,
  LearningVelocitySnapshotRepository,
  RecordPredictionOutcomeHandler,
  RegisterFeatureInCatalogueHandler,
  GetFeatureCatalogueHandler,
  GetInterventionCatalogueHandler,
  GetLifecycleMetricsHandler
} from './index';
import {
  ReadinessPrediction,
  ReadinessSnapshot,
  PredictionExperiment,
  PredictionIntervention,
  PredictionFeatureCatalogueEntry,
  PredictionOutcome,
  PredictionInterventionCatalogueEntry,
  LearningVelocitySnapshot,
  ReadinessScore,
  ConfidenceBand
} from '@clasptek/domain-prediction-engine';

// Mock repositories implementation
const createMockRepos = () => {
  const predictionDb = new Map<string, ReadinessPrediction>();
  const snapshotDb = new Map<string, ReadinessSnapshot>();
  const experimentDb = new Map<string, PredictionExperiment>();
  const featureDb = new Map<string, PredictionFeatureCatalogueEntry>();
  const outcomeDb = new Map<string, PredictionOutcome>();
  const interventionDb = new Map<string, PredictionInterventionCatalogueEntry>();
  const velocityDb = new Map<string, LearningVelocitySnapshot>();

  const predictionRepo: ReadinessPredictionRepository = {
    save: vi.fn().mockImplementation(async (pred: ReadinessPrediction) => {
      predictionDb.set(pred.id, pred);
    }),
    findById: vi.fn().mockImplementation(async (id: string) => {
      return predictionDb.get(id) || null;
    }),
    findLatestByStudent: vi.fn().mockImplementation(async (studentId: string, profileId: string) => {
      const preds = Array.from(predictionDb.values())
        .filter(p => p.studentId === studentId && p.profileId === profileId && p.status === 'PUBLISHED')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return preds[0] || null;
    }),
    findHistoryByStudent: vi.fn().mockImplementation(async (studentId: string, profileId: string) => {
      return Array.from(predictionDb.values())
        .filter(p => p.studentId === studentId && p.profileId === profileId);
    }),
    search: vi.fn().mockImplementation(async (filters) => {
      let results = Array.from(predictionDb.values());
      if (filters.studentId) results = results.filter(p => p.studentId === filters.studentId);
      if (filters.profileId) results = results.filter(p => p.profileId === filters.profileId);
      if (filters.status) results = results.filter(p => p.status === filters.status);
      return results;
    })
  };

  const snapshotRepo: ReadinessSnapshotRepository = {
    save: vi.fn().mockImplementation(async (snap: ReadinessSnapshot) => {
      snapshotDb.set(snap.id, snap);
    }),
    findById: vi.fn().mockImplementation(async (id: string) => {
      return snapshotDb.get(id) || null;
    }),
    findLatestByStudent: vi.fn().mockImplementation(async (studentId: string) => {
      const snaps = Array.from(snapshotDb.values()).filter(s => s.studentId === studentId);
      return snaps[0] || null;
    })
  };

  const experimentRepo: PredictionExperimentRepository = {
    save: vi.fn().mockImplementation(async (exp: PredictionExperiment) => {
      experimentDb.set(exp.id, exp);
    }),
    findById: vi.fn().mockImplementation(async (id: string) => {
      return experimentDb.get(id) || null;
    }),
    findActiveExperiment: vi.fn().mockImplementation(async () => {
      return Array.from(experimentDb.values()).find(e => e.status === 'RUNNING') || null;
    }),
    findByCode: vi.fn().mockImplementation(async (code: string) => {
      return Array.from(experimentDb.values()).find(e => e.experimentCode === code) || null;
    })
  };

  const modelVersionRepo: ModelVersionRepository = {
    findById: vi.fn().mockResolvedValue(null),
    findCurrentByModelCode: vi.fn().mockResolvedValue(null)
  };

  const featureCatalogueRepo: PredictionFeatureCatalogueRepository = {
    save: vi.fn().mockImplementation(async (entry: PredictionFeatureCatalogueEntry) => {
      featureDb.set(entry.id, entry);
    }),
    findByCode: vi.fn().mockImplementation(async (code: string) => {
      return Array.from(featureDb.values()).find(f => f.featureCode === code) || null;
    }),
    findAll: vi.fn().mockImplementation(async () => {
      return Array.from(featureDb.values());
    })
  };

  const outcomeRepo: PredictionOutcomeRepository = {
    save: vi.fn().mockImplementation(async (outcome: PredictionOutcome) => {
      outcomeDb.set(outcome.id, outcome);
    }),
    findById: vi.fn().mockImplementation(async (id: string) => {
      return outcomeDb.get(id) || null;
    }),
    findByPredictionId: vi.fn().mockImplementation(async (predId: string) => {
      return Array.from(outcomeDb.values()).find(o => o.predictionId === predId) || null;
    }),
    findAll: vi.fn().mockImplementation(async () => {
      return Array.from(outcomeDb.values());
    })
  };

  const interventionCatalogueRepo: PredictionInterventionCatalogueRepository = {
    save: vi.fn().mockImplementation(async (entry: PredictionInterventionCatalogueEntry) => {
      interventionDb.set(entry.id, entry);
    }),
    findByType: vi.fn().mockImplementation(async (type: string) => {
      return Array.from(interventionDb.values()).find(i => i.interventionType === type) || null;
    }),
    findAll: vi.fn().mockImplementation(async () => {
      return Array.from(interventionDb.values());
    })
  };

  const learningVelocityRepo: LearningVelocitySnapshotRepository = {
    save: vi.fn().mockImplementation(async (snap: LearningVelocitySnapshot) => {
      velocityDb.set(snap.id, snap);
    }),
    findLatestByStudent: vi.fn().mockImplementation(async (studId: string) => {
      return Array.from(velocityDb.values()).find(v => v.studentId === studId) || null;
    }),
    findHistoryByStudent: vi.fn().mockImplementation(async (studId: string) => {
      return Array.from(velocityDb.values()).filter(v => v.studentId === studId);
    })
  };

  return {
    predictionRepo,
    snapshotRepo,
    experimentRepo,
    modelVersionRepo,
    featureCatalogueRepo,
    outcomeRepo,
    interventionCatalogueRepo,
    learningVelocityRepo,
    predictionDb,
    snapshotDb,
    experimentDb,
    featureDb,
    outcomeDb,
    interventionDb,
    velocityDb
  };
};

describe('Application Prediction Engine Command & Query Handler Tests', () => {
  test('GeneratePredictionHandler executes and runs predictor strategy successfully', async () => {
    const repos = createMockRepos();
    const handler = new GeneratePredictionHandler(
      repos.predictionRepo,
      repos.snapshotRepo,
      repos.experimentRepo,
      repos.modelVersionRepo
    );

    const result = await handler.execute({
      studentId: 'a0000000-0000-0000-0000-000000000001',
      profileId: 'b0000000-0000-0000-0000-000000000201',
      learnerState: { writing: 7.0, speaking: 7.5, listening: 8.0, reading: 7.0 },
      latestEvaluationSummaries: { exam: 'IELTS' },
      practiceStatistics: { accuracy: 0.82, velocity: 5.0, momentum: 10.0 },
      studyStreak: { current: 7 },
      competencyMastery: { 'IELTS-C1': 'MASTERED' },
      forecastWindow: '14D',
      profileCode: 'IELTS_ACADEMIC'
    });

    expect(result.predictionId).toBeDefined();
    expect(result.snapshotId).toBeDefined();
    expect(result.modelVersionId).toBeDefined();

    // Verify snapshot and prediction are saved
    expect(repos.snapshotRepo.save).toHaveBeenCalled();
    expect(repos.predictionRepo.save).toHaveBeenCalled();

    const savedPred = repos.predictionDb.get(result.predictionId);
    expect(savedPred).toBeDefined();
    expect(savedPred!.status).toBe('DRAFT');
    expect(savedPred!.overallReadinessScore).toBeDefined();
  });

  test('PublishPredictionHandler publishes draft prediction successfully', async () => {
    const repos = createMockRepos();
    const mockPred = new ReadinessPrediction({
      id: 'pred-1',
      studentId: 'a0000000-0000-0000-0000-000000000001',
      profileId: 'b0000000-0000-0000-0000-000000000201',
      modelVersionId: 'b0000000-0000-0000-0000-000000000101',
      status: 'DRAFT'
    });
    repos.predictionDb.set(mockPred.id, mockPred);

    const handler = new PublishPredictionHandler(repos.predictionRepo);
    await handler.execute({ predictionId: 'pred-1' });

    expect(mockPred.status).toBe('PUBLISHED');
    expect(mockPred.publishedAt).toBeDefined();
  });

  test('A/B Testing Experiment Workflow (Create, Start, Complete)', async () => {
    const repos = createMockRepos();
    
    // 1. Create
    const createHandler = new CreateExperimentHandler(repos.experimentRepo);
    const { experimentId } = await createHandler.execute({
      experimentCode: 'EXP-1',
      displayName: 'IELTS Bayesian vs Regression Experiment',
      controlModelVersionId: 'b0000000-0000-0000-0000-000000000101',
      challengerModelVersionId: 'b0000000-0000-0000-0000-000000000102',
      trafficSplitPercentage: 50
    });

    const exp = repos.experimentDb.get(experimentId);
    expect(exp).toBeDefined();
    expect(exp!.status).toBe('DRAFT');

    // 2. Start
    const startHandler = new StartExperimentHandler(repos.experimentRepo);
    await startHandler.execute({ experimentId });
    expect(exp!.status).toBe('RUNNING');

    // 3. Complete
    const completeHandler = new CompleteExperimentHandler(repos.experimentRepo);
    await completeHandler.execute({ experimentId });
    expect(exp!.status).toBe('COMPLETED');
  });

  test('Intervention State Transitions (Trigger, Complete, Discard)', async () => {
    const repos = createMockRepos();
    const intervention = new PredictionIntervention({
      id: 'int-1',
      studentId: 'stud-1',
      riskLevel: 'CRITICAL',
      riskScore: 90.0,
      triggerReason: 'Fail risk',
      status: 'PROPOSED',
      recommendations: []
    });

    const mockPred = new ReadinessPrediction({
      id: 'pred-1',
      studentId: 'a0000000-0000-0000-0000-000000000001',
      profileId: 'b0000000-0000-0000-0000-000000000201',
      modelVersionId: 'b0000000-0000-0000-0000-000000000101',
      status: 'DRAFT',
      interventions: [intervention]
    });
    repos.predictionDb.set(mockPred.id, mockPred);

    const triggerHandler = new TriggerInterventionHandler(repos.predictionRepo);
    await triggerHandler.execute({ predictionId: 'pred-1', interventionId: 'int-1' });
    expect(intervention.status).toBe('ACTIVE');

    const completeHandler = new CompleteInterventionHandler(repos.predictionRepo);
    await completeHandler.execute({ predictionId: 'pred-1', interventionId: 'int-1' });
    expect(intervention.status).toBe('COMPLETED');

    const discardHandler = new DiscardInterventionHandler(repos.predictionRepo);
    await discardHandler.execute({ predictionId: 'pred-1', interventionId: 'int-1' });
    expect(intervention.status).toBe('DISCARDED');
  });

  test('Queries fetch records from repository successfully', async () => {
    const repos = createMockRepos();
    const mockPred = new ReadinessPrediction({
      id: 'pred-1',
      studentId: 'a0000000-0000-0000-0000-000000000001',
      profileId: 'b0000000-0000-0000-0000-000000000201',
      modelVersionId: 'b0000000-0000-0000-0000-000000000101',
      status: 'PUBLISHED'
    });
    repos.predictionDb.set(mockPred.id, mockPred);

    // GetLatest
    const latestQuery = new GetLatestPredictionHandler(repos.predictionRepo);
    const latest = await latestQuery.execute({
      studentId: 'a0000000-0000-0000-0000-000000000001',
      profileId: 'b0000000-0000-0000-0000-000000000201'
    });
    expect(latest).not.toBeNull();
    expect(latest!.id).toBe('pred-1');

    // GetHistory
    const historyQuery = new GetPredictionHistoryHandler(repos.predictionRepo);
    const history = await historyQuery.execute({
      studentId: 'a0000000-0000-0000-0000-000000000001',
      profileId: 'b0000000-0000-0000-0000-000000000201'
    });
    expect(history.length).toBe(1);

    // Search
    const searchQuery = new SearchPredictionsHandler(repos.predictionRepo);
    const list = await searchQuery.execute({
      studentId: 'a0000000-0000-0000-0000-000000000001',
      status: 'PUBLISHED'
    });
    expect(list.length).toBe(1);

    // Active Experiment
    const activeQuery = new GetActiveExperimentHandler(repos.experimentRepo);
    const activeExp = await activeQuery.execute();
    expect(activeExp).toBeNull();
  });

  test('New governance application command and query handlers behave correctly', async () => {
    const repos = createMockRepos();

    // 1. Register Feature Handler
    const registerFeature = new RegisterFeatureInCatalogueHandler(repos.featureCatalogueRepo);
    const { featureId } = await registerFeature.execute({
      featureCode: 'ACCURACY_RATE',
      displayName: 'Average Accuracy Rate',
      sourceDomain: 'AI Evaluation',
      normalizationMethod: 'MinMax',
      defaultWeight: 0.70,
      version: 'v1.0.0',
      description: 'Test description'
    });
    expect(featureId).toBeDefined();

    const feature = repos.featureDb.get(featureId);
    expect(feature).toBeDefined();
    expect(feature!.featureCode).toBe('ACCURACY_RATE');

    // Duplicate registration throws
    await expect(registerFeature.execute({
      featureCode: 'ACCURACY_RATE',
      displayName: 'Average Accuracy Rate',
      sourceDomain: 'AI Evaluation',
      normalizationMethod: 'MinMax',
      defaultWeight: 0.70,
      version: 'v1.0.0'
    })).rejects.toThrow();

    // 2. Query feature catalogue
    const getFeatures = new GetFeatureCatalogueHandler(repos.featureCatalogueRepo);
    const features = await getFeatures.execute();
    expect(features.length).toBe(1);

    // 3. Record outcome handler
    const mockPred = new ReadinessPrediction({
      id: 'pred-1',
      studentId: 'stud-1',
      profileId: 'prof-1',
      modelVersionId: 'mv-1',
      status: 'PUBLISHED',
      overallReadinessScore: new ReadinessScore(7.5, 'band'),
      confidence: new ConfidenceBand(0.90, 7.0, 8.0)
    });
    repos.predictionDb.set(mockPred.id, mockPred);

    const recordOutcome = new RecordPredictionOutcomeHandler(repos.outcomeRepo, repos.predictionRepo);
    const { outcomeId } = await recordOutcome.execute({
      predictionId: 'pred-1',
      studentId: 'stud-1',
      actualScore: 8.0
    });
    expect(outcomeId).toBeDefined();

    const outcome = repos.outcomeDb.get(outcomeId);
    expect(outcome).toBeDefined();
    expect(outcome!.predictedScore).toBe(7.5);
    expect(outcome!.actualScore).toBe(8.0);
    expect(outcome!.variance).toBe(0.5);

    // 4. Query intervention catalogue mock seeding/fetch
    const getInterventions = new GetInterventionCatalogueHandler(repos.interventionCatalogueRepo);
    const entry = new PredictionInterventionCatalogueEntry({
      id: 'int-ent-1',
      interventionType: 'GRAMMAR_HELP',
      title: 'Grammar Support',
      description: 'Support classes',
      priority: 1
    });
    await repos.interventionCatalogueRepo.save(entry);
    const interventions = await getInterventions.execute();
    expect(interventions.length).toBe(1);
    expect(interventions[0].interventionType).toBe('GRAMMAR_HELP');

    // 5. Query metrics handler
    const getMetrics = new GetLifecycleMetricsHandler(repos.outcomeRepo, repos.predictionRepo);
    const metrics = await getMetrics.execute();
    expect(metrics.totalPredictions).toBe(1);
    expect(metrics.totalOutcomes).toBe(1);
    expect(metrics.averageDrift).toBe(0.5);
    expect(metrics.accuracyMAE).toBe(0.5);
  });
});
