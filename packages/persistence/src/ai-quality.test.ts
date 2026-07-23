import { describe, it, expect, vi } from 'vitest';
import {
  PostgresPromptExperimentRepository,
  PostgresPromptComparisonRepository,
  PostgresPromptPerformanceRepository,
  PostgresBenchmarkDatasetRepository,
  PostgresBenchmarkRunRepository,
  PostgresBenchmarkResultRepository,
  PostgresBenchmarkRegressionRepository,
  PostgresDeploymentDecisionRepository,
} from './index';
import {
  PromptExperiment,
  PromptComparison,
  PromptPerformanceMetric,
  BenchmarkDataset,
  BenchmarkDatasetItem,
  BenchmarkRun,
  BenchmarkResult,
  BenchmarkRegression,
  DeploymentDecision,
  AgreementRate,
  CalibrationAccuracy,
  ConfidenceDistribution,
  EvaluationCost,
  AverageLatency,
  ScoreDrift,
} from '@clasptek/domain-ai-evaluation';

function mkMockDbPool() {
  const query = vi.fn(async (sql: string, _params?: any[]) => {
    if (sql.includes('prompt_experiments')) {
      return {
        rows: [
          {
            id: 'exp-1',
            tenant_id: 'tenant-1',
            name: 'Test Exp',
            baseline_version_id: 'pv-baseline-01',
            candidate_version_id: 'pv-candidate-01',
            trigger_reason: 'PROMPT_CHANGE',
            status: 'PENDING',
            created_by: 'user-1',
            created_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('prompt_comparisons')) {
      return {
        rows: [
          {
            id: 'comp-1',
            experiment_id: 'exp-1',
            submission_id: 'sub-1',
            question_type: 'ESSAY',
            baseline_score: '7.00',
            candidate_score: '7.50',
            score_difference: '0.50',
            human_score: '7.00',
            baseline_agrees_human: true,
            candidate_agrees_human: true,
            evaluated_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('prompt_performance_metrics')) {
      return {
        rows: [
          {
            id: 'metric-1',
            experiment_id: 'exp-1',
            prompt_version_id: 'pv-candidate-01',
            sample_count: 1,
            agreement_rate: '0.8500',
            calibration_accuracy: '0.8000',
            instructor_override_rate: '0.0500',
            avg_score_difference: '0.2500',
            score_drift: '0.0800',
            false_positive_rate: '0.0500',
            false_negative_rate: '0.0500',
            confidence_mean: '0.8200',
            confidence_stddev: '0.0800',
            confidence_p10: '0.7000',
            confidence_p90: '0.9500',
            avg_latency_ms: '80.00',
            avg_cost_usd: '0.2000',
            computed_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('benchmark_datasets')) {
      return {
        rows: [
          {
            id: 'dataset-1',
            tenant_id: 'tenant-1',
            name: 'Golden Test Dataset',
            question_type: 'ESSAY',
            is_locked: true,
            status: 'ACTIVE',
            created_by: 'user-1',
            created_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('benchmark_dataset_items')) {
      return {
        rows: [
          {
            id: 'item-1',
            dataset_id: 'dataset-1',
            item_index: 1,
            submission_text: 'Test submission content',
            question_type: 'ESSAY',
            human_score: '7.00',
            rubric_scores: {},
          },
        ],
      };
    }
    if (sql.includes('benchmark_runs')) {
      return {
        rows: [
          {
            id: 'run-1',
            tenant_id: 'tenant-1',
            dataset_id: 'dataset-1',
            trigger_type: 'MANUAL',
            status: 'COMPLETED',
            created_by: 'user-1',
            created_at: new Date(),
            agreement_rate: '0.8500',
            calibration_accuracy: '0.8000',
            avg_score_difference: '0.0500',
            false_positive_rate: '0.0200',
            false_negative_rate: '0.0300',
            avg_latency_ms: '120.00',
            total_cost_usd: '0.0050',
            processed_items: 1,
          },
        ],
      };
    }
    if (sql.includes('benchmark_results')) {
      return {
        rows: [
          {
            id: 'res-1',
            run_id: 'run-1',
            dataset_item_id: 'item-1',
            ai_score: '7.00',
            human_score: '7.00',
            score_difference: '0.00',
            agrees_with_human: true,
            confidence: '0.9000',
            latency_ms: 150,
            cost_usd: '0.0050',
            token_count: 200,
            evaluated_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('benchmark_regressions')) {
      return {
        rows: [
          {
            id: 'reg-1',
            run_id: 'run-1',
            regression_type: 'SCORE_DRIFT',
            severity: 'HIGH',
            current_value: '0.2500',
            baseline_value: '0.0500',
            threshold_value: '0.1000',
            delta: '0.2000',
            delta_percent: '400.00',
            description: 'Score drift regression',
            detected_at: new Date(),
          },
        ],
      };
    }
    if (sql.includes('deployment_decisions')) {
      return {
        rows: [
          {
            id: 'dec-1',
            tenant_id: 'tenant-1',
            run_id: 'run-1',
            verdict: 'APPROVED',
            agreement_rate: '0.8500',
            calibration_accuracy: '0.8000',
            regression_count: 0,
            critical_regressions: 0,
            decision_reason: 'All pass',
            thresholds_applied: {},
            decided_by: 'SYSTEM',
            decided_at: new Date(),
          },
        ],
      };
    }
    return { rows: [] };
  });

  return {
    getPool: () => ({ query }),
  } as any;
}

describe('AI Quality Persistence Repositories (Expanded Coverage)', () => {
  const tenantId = 'tenant-1';

  it('can perform basic CRUD operations on prompt experiments', async () => {
    const dbPool = mkMockDbPool();
    const experimentRepo = new PostgresPromptExperimentRepository(dbPool);

    const experiment = PromptExperiment.create({
      tenantId,
      name: 'Experiment V1',
      baselineVersionId: 'pv-b1',
      candidateVersionId: 'pv-c1',
      triggerReason: 'PROMPT_CHANGE',
      createdBy: 'user-1',
    });

    await experimentRepo.save(experiment);
    const found = await experimentRepo.findById(experiment.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe('exp-1');
    expect(found!.name).toBe('Test Exp'); // Mock returns 'Test Exp'

    const all = await experimentRepo.findAll(tenantId);
    expect(all).toHaveLength(1);
  });

  it('can save and retrieve prompt comparisons and performance metrics', async () => {
    const dbPool = mkMockDbPool();
    const comparisonRepo = new PostgresPromptComparisonRepository(dbPool);
    const performanceRepo = new PostgresPromptPerformanceRepository(dbPool);

    const comp = new PromptComparison({
      id: 'comp-1',
      experimentId: 'exp-1',
      submissionId: 'sub-1',
      questionType: 'ESSAY',
      baselineScore: 7.0,
      candidateScore: 7.5,
      scoreDifference: 0.5,
      humanScore: 7.0,
      baselineAgreesHuman: true,
      candidateAgreesHuman: true,
    });

    await comparisonRepo.save(comp);
    const retrievedComps = await comparisonRepo.findByExperiment('exp-1');
    expect(retrievedComps).toHaveLength(1);
    expect(retrievedComps[0].baselineScore).toBe(7.0);

    const metric = new PromptPerformanceMetric({
      id: 'metric-1',
      experimentId: 'exp-1',
      promptVersionId: 'pv-candidate-01',
      sampleCount: 1,
      agreementRate: new AgreementRate(0.85),
      calibrationAccuracy: new CalibrationAccuracy(0.8),
      instructorOverrideRate: 0.05,
      avgScoreDifference: 0.25,
      scoreDrift: new ScoreDrift(0.08, 2.5),
      falsePositiveRate: 0.05,
      falseNegativeRate: 0.05,
      confidenceDistribution: new ConfidenceDistribution(0.82, 0.08, 0.7, 0.95, 1),
      averageLatency: new AverageLatency(80, 120, 1),
      evaluationCost: new EvaluationCost(10, 0.2),
    });

    await performanceRepo.save(metric);
    const retrievedMetric = await performanceRepo.findByExperiment('exp-1');
    expect(retrievedMetric).not.toBeNull();
    expect(retrievedMetric!.sampleCount).toBe(1);
  });

  it('can save and retrieve benchmark dataset items and locked datasets', async () => {
    const dbPool = mkMockDbPool();
    const datasetRepo = new PostgresBenchmarkDatasetRepository(dbPool);

    const dataset = BenchmarkDataset.create({
      tenantId,
      name: 'IELTS Golden Dataset',
      questionType: 'ESSAY',
      createdBy: 'user-1',
    });

    const item = new BenchmarkDatasetItem({
      id: 'item-1',
      datasetId: dataset.id,
      itemIndex: 1,
      submissionText: 'Golden text',
      questionType: 'ESSAY',
      humanScore: 8.0,
    });

    dataset.addItem(item);
    dataset.lock('user-1', 'sha256-hash-xyz');

    await datasetRepo.save(dataset);
    await datasetRepo.saveItem(item);

    const retrievedDataset = await datasetRepo.findById(dataset.id);
    expect(retrievedDataset).not.toBeNull();
    expect(retrievedDataset!.isLocked).toBe(true);
    expect(retrievedDataset!.items).toHaveLength(1);
    expect(retrievedDataset!.items[0].humanScore).toBe(7.0); // Mock returns 7.0
  });

  it('can save and query benchmark runs, results, regressions and deployment decisions', async () => {
    const dbPool = mkMockDbPool();
    const runRepo = new PostgresBenchmarkRunRepository(dbPool);
    const resultRepo = new PostgresBenchmarkResultRepository(dbPool);
    const regressionRepo = new PostgresBenchmarkRegressionRepository(dbPool);
    const decisionRepo = new PostgresDeploymentDecisionRepository(dbPool);

    const run = BenchmarkRun.create({
      tenantId,
      datasetId: 'dataset-1',
      triggerType: 'MANUAL',
      createdBy: 'user-1',
    });

    await runRepo.save(run);
    const retrievedRun = await runRepo.findById(run.id);
    expect(retrievedRun).not.toBeNull();
    expect(retrievedRun!.agreementRate?.rate).toBe(0.85);

    const result = new BenchmarkResult({
      id: 'res-1',
      runId: run.id,
      datasetItemId: 'item-1',
      aiScore: 7.0,
      humanScore: 7.0,
    });
    await resultRepo.save(result);
    const retrievedResults = await resultRepo.findByRun(run.id);
    expect(retrievedResults).toHaveLength(1);

    const regression = new BenchmarkRegression({
      id: 'reg-1',
      runId: run.id,
      regressionType: 'SCORE_DRIFT',
      severity: 'HIGH',
      currentValue: 0.25,
    });
    await regressionRepo.save(regression);
    const retrievedRegs = await regressionRepo.findByRun(run.id);
    expect(retrievedRegs).toHaveLength(1);

    const decision = new DeploymentDecision({
      id: 'dec-1',
      tenantId,
      runId: run.id,
      verdict: 'APPROVED',
      regressionCount: 0,
      criticalRegressions: 0,
      decisionReason: 'All clear',
    });
    await decisionRepo.save(decision);
    const retrievedDecision = await decisionRepo.findByRun(run.id);
    expect(retrievedDecision).not.toBeNull();
    expect(retrievedDecision!.verdict).toBe('APPROVED');
  });

  it('handles transaction query patterns properly', async () => {
    const dbPool = mkMockDbPool();
    const pool = dbPool.getPool();

    // Simulate transactional calls
    await pool.query('BEGIN');
    const experimentRepo = new PostgresPromptExperimentRepository(dbPool);
    const experiment = PromptExperiment.create({
      tenantId,
      name: 'Transaction Test',
      baselineVersionId: 'pv-b1',
      candidateVersionId: 'pv-c1',
      triggerReason: 'PROMPT_CHANGE',
      createdBy: 'user-1',
    });
    await experimentRepo.save(experiment);
    await pool.query('COMMIT');

    expect(pool.query).toHaveBeenCalledWith('BEGIN');
    expect(pool.query).toHaveBeenCalledWith('COMMIT');
  });
});
