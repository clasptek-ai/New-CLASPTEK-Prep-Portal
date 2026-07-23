import { describe, it, expect } from 'vitest';
import {
  AgreementRate,
  CalibrationAccuracy,
  ConfidenceDistribution,
  EvaluationCost,
  AverageLatency,
  ScoreDrift,
  RegressionScore,
  RubricVersion,
  ModelVersion,
  PromptComparisonEngine,
  BenchmarkEngine,
  RegressionDetectionEngine,
  DeploymentDecisionEngine,
  BenchmarkDataset,
  BenchmarkDatasetItem,
  BenchmarkRun,
  BenchmarkRegression,
} from './addendum';
import { MockAIProvider } from './index';

describe('Sprint 2.8 Addendum Value Objects', () => {
  it('creates AgreementRate and checks properties', () => {
    const rate = new AgreementRate(0.85);
    expect(rate.rate).toBe(0.85);
    expect(rate.isAcceptable).toBe(true);
    expect(rate.isGood).toBe(true);
    expect(rate.percentage).toBe(85);
    expect(() => new AgreementRate(1.2)).toThrow();
  });

  it('creates CalibrationAccuracy and checks properties', () => {
    const accuracy = new CalibrationAccuracy(0.88);
    expect(accuracy.value).toBe(0.88);
    expect(accuracy.isCalibrated).toBe(true);
    expect(accuracy.isWellCalibrated).toBe(true);
  });

  it('creates ConfidenceDistribution and checks properties', () => {
    const dist = new ConfidenceDistribution(0.82, 0.08, 0.7, 0.95, 50);
    expect(dist.mean).toBe(0.82);
    expect(dist.stddev).toBe(0.08);
    expect(dist.p10).toBe(0.7);
    expect(dist.p90).toBe(0.95);
    expect(dist.sampleCount).toBe(50);
    expect(dist.isConsistent).toBe(true);
  });

  it('creates EvaluationCost and checks properties', () => {
    const cost = new EvaluationCost(10, 0.2);
    expect(cost.totalUsd).toBe(10);
    expect(cost.perSampleUsd).toBe(0.2);
    expect(cost.currency).toBe('USD');
  });

  it('creates AverageLatency and checks properties', () => {
    const latency = new AverageLatency(80, 120, 100);
    expect(latency.avgMs).toBe(80);
    expect(latency.p95Ms).toBe(120);
    expect(latency.isWithinSLA).toBe(true);
  });

  it('creates ScoreDrift and checks properties', () => {
    const drift = new ScoreDrift(0.08, 2.5);
    expect(drift.delta).toBe(0.08);
    expect(drift.deltaPercent).toBe(2.5);
    expect(drift.indicator).toBe('DRIFTING_UP');
  });

  it('creates RegressionScore and checks properties', () => {
    const reg = new RegressionScore(0.08);
    expect(reg.value).toBe(0.08);
    expect(reg.severity).toBe('MEDIUM');
    expect(reg.requiresBlock).toBe(false);
  });

  it('creates RubricVersion and ModelVersion', () => {
    const rubric = new RubricVersion('IELTS_RUBRIC', 'v2');
    expect(rubric.code).toBe('IELTS_RUBRIC');
    expect(rubric.version).toBe('v2');
    expect(rubric.key).toBe('IELTS_RUBRIC@v2');

    const model = new ModelVersion('gpt-4o', 'OPENAI', 'v1');
    expect(model.modelCode).toBe('gpt-4o');
    expect(model.provider).toBe('OPENAI');
    expect(model.version).toBe('v1');
    expect(model.key).toBe('OPENAI/gpt-4o@v1');
  });
});

describe('Sprint 2.8 Addendum Domain Engines & Services', () => {
  it('PromptComparisonEngine compares baseline and candidate evaluations', () => {
    const engine = new PromptComparisonEngine();
    const result = engine.compare({
      experimentId: 'exp-1',
      promptVersionId: 'pv-candidate',
      samples: [
        {
          submissionId: 'sub-1',
          questionType: 'ESSAY',
          humanScore: 7.0,
          baselineScore: 6.5,
          baselineConfidence: 0.85,
          baselineLatencyMs: 120,
          baselineCostUsd: 0.005,
          candidateScore: 7.0,
          candidateConfidence: 0.9,
          candidateLatencyMs: 100,
          candidateCostUsd: 0.004,
          instructorOverrode: false,
        },
        {
          submissionId: 'sub-2',
          questionType: 'ESSAY',
          humanScore: 6.0,
          baselineScore: 5.0,
          baselineConfidence: 0.8,
          baselineLatencyMs: 130,
          baselineCostUsd: 0.006,
          candidateScore: 6.2,
          candidateConfidence: 0.88,
          candidateLatencyMs: 110,
          candidateCostUsd: 0.005,
          instructorOverrode: true,
          instructorOverrideScore: 6.0,
        },
      ],
    });

    expect(result.comparisons).toHaveLength(2);
    expect(result.baselineAgreementRate.rate).toBe(0.5);
    expect(result.candidateAgreementRate.rate).toBe(1.0);
    expect(result.candidateImproves).toBe(true);
    expect(result.metrics.sampleCount).toBe(2);
  });

  it('RegressionDetectionEngine detects regressions', () => {
    const engine = new RegressionDetectionEngine();
    const regressions = engine.detect({
      runId: 'run-1',
      current: {
        agreementRate: 0.75, // falls below 0.80 threshold
        calibrationAccuracy: 0.8,
        avgScoreDifference: 0.25, // exceeds 0.10 threshold
        falsePositiveRate: 0.05,
        falseNegativeRate: 0.15, // exceeds 0.10 threshold
        avgLatencyMs: 140,
        totalCostUsd: 0.25,
      },
    });

    expect(regressions).toHaveLength(3);
    const types = regressions.map((r) => r.regressionType);
    expect(types).toContain('AGREEMENT_DEGRADATION');
    expect(types).toContain('SCORE_DRIFT');
    expect(types).toContain('FALSE_NEGATIVE_INCREASE');
  });

  it('DeploymentDecisionEngine makes verdict', () => {
    const engine = new DeploymentDecisionEngine();
    const decision = engine.decide({
      tenantId: 'tenant-1',
      runId: 'run-1',
      agreementRate: 0.85,
      calibrationAccuracy: 0.8,
      regressions: [
        new BenchmarkRegression({
          id: 'reg-1',
          runId: 'run-1',
          regressionType: 'SCORE_DRIFT',
          severity: 'CRITICAL',
          currentValue: 0.25,
        }),
      ],
    });

    expect(decision.verdict).toBe('REJECTED'); // rejected due to critical regressions
    expect(decision.decisionReason).toContain('critical regression');
  });

  it('BenchmarkEngine executes benchmark dataset', async () => {
    const provider = new MockAIProvider();
    const engine = new BenchmarkEngine(provider);

    const dataset = BenchmarkDataset.create({
      tenantId: 'tenant-1',
      name: 'IELTS Golden Dataset',
      questionType: 'ESSAY',
      createdBy: 'admin-1',
    });

    const item = new BenchmarkDatasetItem({
      id: 'item-1',
      datasetId: dataset.id,
      itemIndex: 1,
      submissionText: 'The essay text response content',
      questionType: 'ESSAY',
      humanScore: 7.0,
    });
    dataset.addItem(item);
    dataset.lock('admin-1', 'hash-123');

    const run = BenchmarkRun.create({
      tenantId: 'tenant-1',
      datasetId: dataset.id,
      triggerType: 'MANUAL',
      createdBy: 'admin-1',
    });

    const summary = await engine.execute({
      run,
      dataset,
      buildPrompt: () => ({ systemPrompt: 'sys', userPrompt: 'user' }),
      parseScore: () => ({ score: 7.0, confidence: 0.9 }),
    });

    expect(summary.processedItems).toBe(1);
    expect(summary.agreementRate.rate).toBe(1.0);
    expect(run.status).toBe('COMPLETED');
  });
});
