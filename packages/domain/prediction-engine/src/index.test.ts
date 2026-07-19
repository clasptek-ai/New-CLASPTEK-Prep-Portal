import { describe, test, expect } from 'vitest';
import {
  ReadinessScore,
  ConfidenceBand,
  ReadinessSnapshot,
  ReadinessPrediction,
  PredictionExperiment,
  PredictionStrategyRegistry,
  PredictionFeatureSet,
  PredictionExplanation,
  PredictionEvidence,
  PredictionTrend,
  PredictionIntervention,
  PredictionRecommendation,
  ModelConfiguration,
  ModelLineage,
  ModelVersion,
  PredictionFeatureCatalogueEntry,
  PredictionOutcome,
  PredictionInterventionCatalogueEntry,
  LearningVelocitySnapshot
} from './index';

describe('Domain Prediction Engine Aggregate & Strategy Tests', () => {
  test('Create Value Objects and assert validation constraints', () => {
    // Score
    const score = new ReadinessScore(75.5, 'percentage');
    expect(score.value).toBe(75.5);
    expect(score.scale).toBe('percentage');
    expect(() => new ReadinessScore(-10, 'scale')).toThrow();

    // Confidence Band
    const band = new ConfidenceBand(0.95, 70.0, 80.0);
    expect(band.confidence).toBe(0.95);
    expect(band.low).toBe(70.0);
    expect(band.high).toBe(80.0);
    expect(() => new ConfidenceBand(1.5, 70, 80)).toThrow();
    expect(() => new ConfidenceBand(0.8, 85, 70)).toThrow();
  });

  test('Create ReadinessSnapshot aggregate successfully', () => {
    const snap = ReadinessSnapshot.create({
      studentId: 'a0000000-0000-0000-0000-000000000001',
      learnerState: { writing: 6.5, speaking: 7.0 },
      latestEvaluationSummaries: { exam: 'IELTS-AC' },
      practiceStatistics: { accuracy: 0.75, velocity: 3.2 },
      studyStreak: { current: 5 },
      competencyMastery: { 'IELTS-LIS-C1': 'MASTERED' },
      forecastWindow: '14D'
    });

    expect(snap.studentId).toBe('a0000000-0000-0000-0000-000000000001');
    expect(snap.forecastWindow).toBe('14D');
    expect(snap.learnerState.writing).toBe(6.5);
  });

  test('Generate and complete ReadinessPrediction aggregate including events', () => {
    const pred = ReadinessPrediction.generate({
      studentId: 'a0000000-0000-0000-0000-000000000001',
      profileId: 'b0000000-0000-0000-0000-000000000201',
      modelVersionId: 'b0000000-0000-0000-0000-000000000101'
    });

    expect(pred.status).toBe('DRAFT');

    const score = new ReadinessScore(75.0, 'points');
    const band = new ConfidenceBand(0.90, 70.0, 80.0);
    const featureSet = new PredictionFeatureSet({
      id: 'f-1',
      features: { ACCURACY_RATE: 0.75 }
    });
    const explanation = new PredictionExplanation({
      id: 'exp-1',
      contributingFactors: [{ factor: 'Accuracy', weight: 1.0 }],
      featureImportance: { ACCURACY_RATE: 1.0 },
      confidenceExplanation: 'High accuracy',
      evidenceReferences: ['snap-1']
    });
    const evidence = [
      new PredictionEvidence({ id: 'ev-1', evidenceType: 'PRACTICE', evidenceSourceId: 'src-1', weight: 0.5, description: 'Practice complete' })
    ];
    const trends = [
      new PredictionTrend({ id: 'tr-1', trendType: 'ACCURACY', slope: 0.05, explanation: 'Improving accuracy' })
    ];
    const rec = new PredictionRecommendation({ id: 'rec-1', recommendationType: 'DRILL', priority: 1, title: 'Vocabulary Drill' });
    const interventions = [
      new PredictionIntervention({
        id: 'int-1',
        studentId: 'a0000000-0000-0000-0000-000000000001',
        riskLevel: 'CRITICAL',
        riskScore: 85.0,
        triggerReason: 'Critical risk triggered',
        status: 'PROPOSED',
        recommendations: [rec]
      })
    ];

    pred.completePrediction(score, band, featureSet, explanation, evidence, trends, interventions);

    expect(pred.overallReadinessScore!.value).toBe(75.0);
    expect(pred.evidence.length).toBe(1);
    expect(pred.trends.length).toBe(1);
    expect(pred.interventions.length).toBe(1);
    expect(pred.interventions[0].status).toBe('PROPOSED');

    // Test Domain Events
    expect(pred.domainEvents.length).toBe(2); // PredictionGenerated + InterventionTriggered (CRITICAL)
    expect((pred.domainEvents[0] as any).eventName).toBe('PredictionGenerated');
    expect((pred.domainEvents[1] as any).eventName).toBe('InterventionTriggered');

    // Publish
    pred.publish();
    expect(pred.status).toBe('PUBLISHED');
    expect(pred.domainEvents.length).toBe(3); // + PredictionPublished
    expect((pred.domainEvents[2] as any).eventName).toBe('PredictionPublished');
  });

  test('Create and manage PredictionExperiment successfully', () => {
    const exp = PredictionExperiment.create({
      experimentCode: 'EXP-IELTS-AC',
      displayName: 'IELTS A/B Model Experiment',
      controlModelVersionId: 'b0000000-0000-0000-0000-000000000101',
      challengerModelVersionId: 'b0000000-0000-0000-0000-000000000102',
      trafficSplitPercentage: 50
    });

    expect(exp.status).toBe('DRAFT');
    expect(exp.domainEvents.length).toBe(1);
    expect((exp.domainEvents[0] as any).eventName).toBe('ExperimentCreated');

    exp.start();
    expect(exp.status).toBe('RUNNING');
    expect(exp.startDate).toBeDefined();

    exp.complete();
    expect(exp.status).toBe('COMPLETED');
    expect(exp.endDate).toBeDefined();

    exp.archive();
    expect(exp.status).toBe('ARCHIVED');
  });

  test('Registry resolves registered engines correctly', () => {
    const registry = PredictionStrategyRegistry.instance;
    
    // Resolve Bayesian Predictor
    const bayes = registry.get('BAYESIAN');
    expect(bayes).toBeDefined();

    // Resolve Mock Predictor
    const mock = registry.get('MOCK');
    expect(mock).toBeDefined();

    // Resolve Regression Predictor
    const regr = registry.get('REGRESSION');
    expect(regr).toBeDefined();

    // Resolve Weighted Rubric Predictor
    const rubr = registry.get('WEIGHTED_RUBRIC');
    expect(rubr).toBeDefined();

    // Unknown registry key throws error
    expect(() => registry.get('DEEP_NEURAL')).toThrow();
  });

  test('MockPredictor generates valid outputs matching config', async () => {
    const registry = PredictionStrategyRegistry.instance;
    const mock = registry.get('MOCK');

    const snap = ReadinessSnapshot.create({
      studentId: 'a0000000-0000-0000-0000-000000000001',
      learnerState: {},
      latestEvaluationSummaries: {},
      practiceStatistics: {},
      studyStreak: {},
      competencyMastery: {},
      forecastWindow: '7D'
    });

    const config = new ModelConfiguration({ mock_score: 82.5, mock_confidence: 0.95 });
    const result = await mock.predict(snap, config);

    expect(result.overallScore).toBe(82.5);
    expect(result.confidence.confidence).toBe(0.95);
    expect(result.confidence.low).toBe(77.5);
    expect(result.confidence.high).toBe(87.5);
    expect(result.features.ACCURACY_RATE).toBe(0.78);
  });

  test('New governance constructs are instantiated and behave correctly', () => {
    // Model Lineage & Version
    const lineage = new ModelLineage({
      supersedesVersionId: 'old-v1',
      trainedFromDataset: 'hash-abc',
      calibrationDatasetRef: 'hash-xyz',
      deploymentDate: new Date(),
      retirementDate: new Date()
    });
    const config = new ModelConfiguration({ mock_score: 75 }, lineage);
    expect(config.lineage).toBeDefined();
    expect(config.lineage!.trainedFromDataset).toBe('hash-abc');

    const mv = new ModelVersion({
      id: 'mv-new',
      modelId: 'm-1',
      versionString: 'v2.0.0',
      configuration: config,
      isCurrent: true,
      lineage
    });
    expect(mv.versionString).toBe('v2.0.0');
    expect(mv.isCurrent).toBe(true);

    // Feature Catalogue Entry
    const feat = PredictionFeatureCatalogueEntry.create({
      featureCode: 'VELOCITY_METRIC',
      displayName: 'Velocity Metric',
      sourceDomain: 'Student Learning',
      normalizationMethod: 'Standardization',
      defaultWeight: 0.85,
      version: 'v1.1.0'
    });
    expect(feat.featureCode).toBe('VELOCITY_METRIC');
    expect(feat.normalizationMethod).toBe('Standardization');
    expect(feat.normalization).toBe('Standardization');

    // Intervention Catalogue Entry
    const intEntry = PredictionInterventionCatalogueEntry.create({
      interventionType: 'ADVANCED_SUPPORT',
      title: 'Advanced Support Program',
      description: 'Custom instructor support session',
      priority: 3,
      targetCompetencyCode: 'IELTS-COMP-3'
    });
    expect(intEntry.interventionType).toBe('ADVANCED_SUPPORT');
    expect(intEntry.recommendationType).toBe('ADVANCED_SUPPORT');

    // Outcomes tracking
    const outcome = PredictionOutcome.create({
      predictionId: 'pred-123',
      studentId: 'stud-123',
      predictedScore: 80.0,
      actualScore: 85.0
    });
    expect(outcome.predictionId).toBe('pred-123');
    expect(outcome.variance).toBe(5.0);
    expect(outcome.calibrationDelta).toBe(5.0);

    // Learning Velocity Snapshot
    const velSnap = LearningVelocitySnapshot.create({
      studentId: 'stud-123',
      activeHours: 4.5,
      questionsAnswered: 25,
      accelerationRate: 0.5,
      stagnationIndicator: false
    });
    expect(velSnap.activeHours).toBe(4.5);
    expect(velSnap.questionsAnswered).toBe(25);
    expect(velSnap.stagnationIndicator).toBe(false);
  });
});
