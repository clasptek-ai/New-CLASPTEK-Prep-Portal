import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { DatabasePool } from './index';
import {
  PostgresReadinessSnapshotRepository,
  PostgresPredictionExperimentRepository,
  PostgresPredictionFeatureRepository,
  PostgresModelVersionRepository,
  PostgresReadinessPredictionRepository,
  PostgresPredictionFeatureCatalogueRepository,
  PostgresPredictionOutcomeRepository,
  PostgresPredictionInterventionCatalogueRepository,
  PostgresLearningVelocitySnapshotRepository
} from './index';
import {
  ReadinessSnapshot,
  PredictionExperiment,
  ReadinessPrediction,
  ReadinessScore,
  ConfidenceBand,
  PredictionFeatureSet,
  PredictionExplanation,
  PredictionEvidence,
  PredictionTrend,
  PredictionIntervention,
  PredictionRecommendation,
  PredictionFeatureCatalogueEntry,
  PredictionOutcome,
  PredictionInterventionCatalogueEntry,
  LearningVelocitySnapshot
} from '@clasptek/domain-prediction-engine';

import { loadEnvironment } from '@clasptek/configuration';
import { ConsoleLogger } from '@clasptek/observability';

let querySqls: string[] = [];
// Mock pg as before...

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, _params?: any[]) => {
    querySqls.push(sql);

    // Mock return values based on table/query
    if (sql.includes('FROM readiness_snapshots')) {
      return {
        rows: [{
          id: 'snap-1',
          student_id: 'stud-1',
          learner_state: { score: 75 },
          latest_evaluation_summaries: {},
          practice_statistics: {},
          study_streak: {},
          competency_mastery: {},
          forecast_window: '14D',
          model_version_id: 'mv-1',
          snapshotted_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM prediction_experiments')) {
      return {
        rows: [{
          id: 'exp-1',
          experiment_code: 'EXP-1',
          display_name: 'Experiment 1',
          control_model_version_id: 'control-1',
          challenger_model_version_id: 'challenger-1',
          traffic_split_percentage: 50,
          status: 'RUNNING',
          start_date: new Date(),
          end_date: null,
          created_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM prediction_features')) {
      return {
        rows: [
          { id: 'feat-1', feature_code: 'ACCURACY', display_name: 'Accuracy', data_type: 'FLOAT', is_active: true }
        ]
      };
    }

    if (sql.includes('FROM prediction_model_versions')) {
      return {
        rows: [{
          id: 'mv-1',
          model_id: 'model-1',
          version_number: '1.0.0',
          is_current: true,
          configuration: { weights: { accuracy: 0.8 } },
          algorithmType: 'BAYESIAN'
        }]
      };
    }

    if (sql.includes('FROM readiness_predictions')) {
      return {
        rows: [{
          id: 'pred-1',
          student_id: 'stud-1',
          profile_id: 'prof-1',
          model_version_id: 'mv-1',
          status: 'PUBLISHED',
          overall_readiness_score: '7.5',
          overall_readiness_score_scale: 'band',
          confidence_value: '0.92',
          confidence_interval_low: '7.0',
          confidence_interval_high: '8.0',
          lock_version: 1,
          created_at: new Date(),
          updated_at: new Date(),
          published_at: new Date()
        }]
      };
    }

    if (sql.includes('FROM prediction_feature_sets')) {
      return { rows: [{ id: 'fs-1', prediction_id: 'pred-1', features: { ACCURACY: 0.8 } }] };
    }

    if (sql.includes('FROM prediction_explanations')) {
      return {
        rows: [{
          id: 'expl-1',
          prediction_id: 'pred-1',
          contributing_factors: JSON.stringify([{ factor: 'Accuracy', weight: 1.0 }]),
          feature_importance: { ACCURACY: 1.0 },
          confidence_explanation: 'High accuracy rate',
          evidence_references: JSON.stringify(['snap-1'])
        }]
      };
    }

    if (sql.includes('FROM prediction_evidence')) {
      return { rows: [{ id: 'ev-1', prediction_id: 'pred-1', evidence_type: 'PRACTICE', evidence_source_id: 'src-1', weight: '1.0', description: 'desc' }] };
    }

    if (sql.includes('FROM prediction_trends')) {
      return { rows: [{ id: 'tr-1', prediction_id: 'pred-1', trend_type: 'ACCURACY', slope: '0.05', explanation: 'exp' }] };
    }

    if (sql.includes('FROM prediction_interventions')) {
      return { rows: [{ id: 'int-1', prediction_id: 'pred-1', student_id: 'stud-1', risk_level: 'CRITICAL', risk_score: '90.0', trigger_reason: 'reason', status: 'ACTIVE' }] };
    }

    if (sql.includes('FROM prediction_recommendations')) {
      return { rows: [{ id: 'rec-1', intervention_id: 'int-1', recommendation_type: 'DRILL', priority: 1, title: 'Title', description: 'desc', target_resource_id: 'res-1', target_competency_code: 'comp-1' }] };
    }

    if (sql.includes('FROM prediction_feature_catalogue')) {
      return { rows: [{ id: 'feat-cat-1', feature_code: 'ACCURACY_RATE', display_name: 'Accuracy', source_domain: 'AI Evaluation', normalization_method: 'None', default_weight: '0.50', version: 'v1.0.0', description: 'desc' }] };
    }

    if (sql.includes('FROM prediction_outcomes')) {
      return { rows: [{ id: 'out-1', prediction_id: 'pred-1', student_id: 'stud-1', predicted_score: '7.50', actual_score: '8.00', variance: '0.50', calibration_delta: '0.50', recorded_at: new Date() }] };
    }

    if (sql.includes('FROM prediction_intervention_catalogue')) {
      return { rows: [{ id: 'int-cat-1', intervention_type: 'GRAMMAR_DRILLS', title: 'Title', description: 'desc', priority: 1, target_resource_id: null, target_competency_code: 'comp-1' }] };
    }

    if (sql.includes('FROM prediction_learning_velocity_history')) {
      return { rows: [{ id: 'vel-1', student_id: 'stud-1', active_hours: '4.50', questions_answered: 20, acceleration_rate: '0.20', stagnation_indicator: false, recorded_at: new Date() }] };
    }

    return { rows: [], rowCount: 0 };
  });

  return {
    Pool: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockResolvedValue({
          release: vi.fn(),
          query: queryMock
        }),
        end: vi.fn().mockResolvedValue(undefined),
        query: queryMock
      };
    })
  };
});

describe('Postgres Bounded Context Repositories Tests', () => {
  let dbPool: DatabasePool;
  const logger = new ConsoleLogger('PersistencePredictionTest');
  const mockConfig = loadEnvironment(process.env);

  beforeEach(async () => {
    querySqls = [];
    dbPool = new DatabasePool(mockConfig, logger);
    await dbPool.connect();
  });

  test('PostgresReadinessSnapshotRepository save and find operations', async () => {
    const repo = new PostgresReadinessSnapshotRepository(dbPool);

    const snapshot = ReadinessSnapshot.create({
      studentId: 'stud-1',
      learnerState: { writing: 6.5 },
      latestEvaluationSummaries: {},
      practiceStatistics: {},
      studyStreak: {},
      competencyMastery: {},
      forecastWindow: '14D'
    });

    await repo.save(snapshot);
    expect(querySqls.some(sql => sql.includes('INSERT INTO readiness_snapshots'))).toBe(true);

    const retrieved = await repo.findById('snap-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.studentId).toBe('stud-1');

    const latest = await repo.findLatestByStudent('stud-1');
    expect(latest).not.toBeNull();
    expect(latest!.id).toBe('snap-1');
  });

  test('PostgresPredictionExperimentRepository save, find and active checks', async () => {
    const repo = new PostgresPredictionExperimentRepository(dbPool);

    const exp = PredictionExperiment.create({
      experimentCode: 'EXP-1',
      displayName: 'Experiment 1',
      controlModelVersionId: 'control-1',
      challengerModelVersionId: 'challenger-1',
      trafficSplitPercentage: 50
    });

    await repo.save(exp);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_experiments'))).toBe(true);

    const retrieved = await repo.findById('exp-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.experimentCode).toBe('EXP-1');

    const active = await repo.findActiveExperiment();
    expect(active).not.toBeNull();
    expect(active!.status).toBe('RUNNING');

    const byCode = await repo.findByCode('EXP-1');
    expect(byCode).not.toBeNull();
    expect(byCode!.displayName).toBe('Experiment 1');
  });

  test('PostgresPredictionFeatureRepository resolve registered features', async () => {
    const repo = new PostgresPredictionFeatureRepository(dbPool);
    const feature = await repo.findByCode('ACCURACY');
    expect(feature).not.toBeNull();
    expect(feature.feature_code).toBe('ACCURACY');

    const all = await repo.findAllActive();
    expect(all.length).toBe(1);
  });

  test('PostgresModelVersionRepository find model configurations and parameters', async () => {
    const repo = new PostgresModelVersionRepository(dbPool);
    const mv = await repo.findById('mv-1');
    expect(mv).not.toBeNull();
    expect(mv.algorithmType).toBe('BAYESIAN');

    const current = await repo.findCurrentByModelCode('BAYESIAN');
    expect(current).not.toBeNull();
    expect(current.version_number).toBe('1.0.0');
  });

  test('PostgresReadinessPredictionRepository save aggregate with components and hydrate back', async () => {
    const repo = new PostgresReadinessPredictionRepository(dbPool);

    const prediction = ReadinessPrediction.generate({
      studentId: 'stud-1',
      profileId: 'prof-1',
      modelVersionId: 'mv-1'
    });

    const score = new ReadinessScore(7.5, 'band');
    const confidence = new ConfidenceBand(0.92, 7.0, 8.0);
    const featureSet = new PredictionFeatureSet({ id: 'fs-1', features: { ACCURACY: 0.8 } });
    const explanation = new PredictionExplanation({
      id: 'expl-1',
      contributingFactors: [{ factor: 'Accuracy', weight: 1.0 }],
      featureImportance: { ACCURACY: 1.0 },
      confidenceExplanation: 'High accuracy rate',
      evidenceReferences: ['snap-1']
    });
    const evidence = [
      new PredictionEvidence({ id: 'ev-1', evidenceType: 'PRACTICE', evidenceSourceId: 'src-1', weight: 1.0, description: 'desc' })
    ];
    const trends = [
      new PredictionTrend({ id: 'tr-1', trendType: 'ACCURACY', slope: 0.05, explanation: 'exp' })
    ];
    const rec = new PredictionRecommendation({ id: 'rec-1', recommendationType: 'DRILL', priority: 1, title: 'Title', description: 'desc', targetResourceId: 'res-1', targetCompetencyCode: 'comp-1' });
    const interventions = [
      new PredictionIntervention({
        id: 'int-1',
        studentId: 'stud-1',
        riskLevel: 'CRITICAL',
        riskScore: 90.0,
        triggerReason: 'reason',
        status: 'ACTIVE',
        recommendations: [rec]
      })
    ];

    prediction.completePrediction(score, confidence, featureSet, explanation, evidence, trends, interventions);
    prediction.publish();

    await repo.save(prediction);

    expect(querySqls.some(sql => sql.includes('INSERT INTO readiness_predictions'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_feature_sets'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_explanations'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_evidence'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_trends'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_interventions'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_recommendations'))).toBe(true);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_history'))).toBe(true);

    const retrieved = await repo.findById('pred-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe('pred-1');
    expect(retrieved!.overallReadinessScore!.value).toBe(7.5);
    expect(retrieved!.overallReadinessScore!.scale).toBe('band');
    expect(retrieved!.confidence!.confidence).toBe(0.92);
    expect(retrieved!.evidence.length).toBe(1);
    expect(retrieved!.trends.length).toBe(1);
    expect(retrieved!.interventions.length).toBe(1);
    expect(retrieved!.interventions[0].recommendations.length).toBe(1);
  });

  test('PostgresPredictionFeatureCatalogueRepository operations', async () => {
    const repo = new PostgresPredictionFeatureCatalogueRepository(dbPool);
    const entry = PredictionFeatureCatalogueEntry.create({
      featureCode: 'ACCURACY_RATE',
      displayName: 'Average Evaluation Accuracy Rate',
      sourceDomain: 'AI Evaluation',
      normalizationMethod: 'None',
      defaultWeight: 0.50,
      version: 'v1.0.0',
      description: 'test'
    });

    await repo.save(entry);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_feature_catalogue'))).toBe(true);

    const found = await repo.findByCode('ACCURACY_RATE');
    expect(found).not.toBeNull();
    expect(found!.featureCode).toBe('ACCURACY_RATE');

    const all = await repo.findAll();
    expect(all.length).toBe(1);
  });

  test('PostgresPredictionOutcomeRepository operations', async () => {
    const repo = new PostgresPredictionOutcomeRepository(dbPool);
    const outcome = PredictionOutcome.create({
      predictionId: 'pred-1',
      studentId: 'stud-1',
      predictedScore: 7.5,
      actualScore: 8.0
    });

    await repo.save(outcome);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_outcomes'))).toBe(true);

    const found = await repo.findById(outcome.id);
    expect(found).not.toBeNull();
    expect(found!.predictionId).toBe('pred-1');

    const foundByPred = await repo.findByPredictionId('pred-1');
    expect(foundByPred).not.toBeNull();
    expect(foundByPred!.actualScore).toBe(8.0);

    const all = await repo.findAll();
    expect(all.length).toBe(1);
  });

  test('PostgresPredictionInterventionCatalogueRepository operations', async () => {
    const repo = new PostgresPredictionInterventionCatalogueRepository(dbPool);
    const entry = PredictionInterventionCatalogueEntry.create({
      interventionType: 'GRAMMAR_DRILLS',
      title: 'Grammar Drills',
      description: 'Review grammatical items',
      priority: 1,
      targetCompetencyCode: 'comp-1'
    });

    await repo.save(entry);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_intervention_catalogue'))).toBe(true);

    const found = await repo.findByType('GRAMMAR_DRILLS');
    expect(found).not.toBeNull();
    expect(found!.interventionType).toBe('GRAMMAR_DRILLS');

    const all = await repo.findAll();
    expect(all.length).toBe(1);
  });

  test('PostgresLearningVelocitySnapshotRepository operations', async () => {
    const repo = new PostgresLearningVelocitySnapshotRepository(dbPool);
    const snapshot = LearningVelocitySnapshot.create({
      studentId: 'stud-1',
      activeHours: 4.5,
      questionsAnswered: 20,
      accelerationRate: 0.2,
      stagnationIndicator: false
    });

    await repo.save(snapshot);
    expect(querySqls.some(sql => sql.includes('INSERT INTO prediction_learning_velocity_history'))).toBe(true);

    const foundLatest = await repo.findLatestByStudent('stud-1');
    expect(foundLatest).not.toBeNull();
    expect(foundLatest!.activeHours).toBe(4.5);

    const history = await repo.findHistoryByStudent('stud-1');
    expect(history.length).toBe(1);
  });
});
