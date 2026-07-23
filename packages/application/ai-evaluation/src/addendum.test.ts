import { describe, it, expect, vi } from 'vitest';
import {
  ComparePromptVersionsHandler,
  RunBenchmarkHandler,
  DetectRegressionHandler,
  ApproveDeploymentHandler,
  type PromptExperimentRepository,
  type PromptComparisonRepository,
  type PromptPerformanceRepository,
  type BenchmarkDatasetRepository,
  type BenchmarkRunRepository,
  type BenchmarkResultRepository,
  type BenchmarkRegressionRepository,
  type DeploymentDecisionRepository,
} from './addendum';
import {
  PromptComparisonEngine,
  BenchmarkEngine,
  RegressionDetectionEngine,
  DeploymentDecisionEngine,
  MockAIProvider,
  BenchmarkDataset,
  BenchmarkDatasetItem,
  BenchmarkRun,
  AgreementRate,
  CalibrationAccuracy,
} from '@clasptek/domain-ai-evaluation';

// Helper mock functions
const makeExperimentRepo = (
  overrides?: Partial<PromptExperimentRepository>
): PromptExperimentRepository => ({
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  ...overrides,
});

const makeComparisonRepo = (
  overrides?: Partial<PromptComparisonRepository>
): PromptComparisonRepository => ({
  save: vi.fn(),
  saveMany: vi.fn(),
  findByExperiment: vi.fn(),
  ...overrides,
});

const makePerformanceRepo = (
  overrides?: Partial<PromptPerformanceRepository>
): PromptPerformanceRepository => ({
  save: vi.fn(),
  findByExperiment: vi.fn(),
  findByVersion: vi.fn(),
  ...overrides,
});

const makeDatasetRepo = (
  overrides?: Partial<BenchmarkDatasetRepository>
): BenchmarkDatasetRepository => ({
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  saveItem: vi.fn(),
  ...overrides,
});

const makeRunRepo = (overrides?: Partial<BenchmarkRunRepository>): BenchmarkRunRepository => ({
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  findLatest: vi.fn(),
  ...overrides,
});

const makeResultRepo = (
  overrides?: Partial<BenchmarkResultRepository>
): BenchmarkResultRepository => ({
  save: vi.fn(),
  saveMany: vi.fn(),
  findByRun: vi.fn(),
  ...overrides,
});

const makeRegressionRepo = (
  overrides?: Partial<BenchmarkRegressionRepository>
): BenchmarkRegressionRepository => ({
  save: vi.fn(),
  saveMany: vi.fn(),
  findByRun: vi.fn(),
  findAll: vi.fn(),
  ...overrides,
});

const makeDecisionRepo = (
  overrides?: Partial<DeploymentDecisionRepository>
): DeploymentDecisionRepository => ({
  save: vi.fn(),
  findByRun: vi.fn(),
  findByExperiment: vi.fn(),
  ...overrides,
});

describe('Sprint 2.8 Addendum Application Command Handlers', () => {
  it('ComparePromptVersionsHandler executes successfully', async () => {
    const experimentRepo = makeExperimentRepo();
    const comparisonRepo = makeComparisonRepo();
    const performanceRepo = makePerformanceRepo();
    const comparisonEngine = new PromptComparisonEngine();

    const handler = new ComparePromptVersionsHandler(
      experimentRepo,
      comparisonRepo,
      performanceRepo,
      comparisonEngine
    );

    const experimentId = await handler.execute({
      tenantId: 'tenant-1',
      experimentName: 'Compare IELTS v2 vs v3',
      baselineVersionId: 'pv-baseline',
      candidateVersionId: 'pv-candidate',
      triggerReason: 'PROMPT_CHANGE',
      createdBy: 'admin-1',
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
      ],
    });

    expect(experimentId).toBeDefined();
    expect(experimentRepo.save).toHaveBeenCalledOnce();
    expect(comparisonRepo.saveMany).toHaveBeenCalledOnce();
    expect(performanceRepo.save).toHaveBeenCalledOnce();
  });

  it('RunBenchmarkHandler runs benchmark items', async () => {
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
      submissionText: 'The essay text',
      questionType: 'ESSAY',
      humanScore: 7.0,
    });
    dataset.addItem(item);
    dataset.lock('admin-1', 'hash-123');

    const datasetRepo = makeDatasetRepo({
      findById: vi.fn().mockResolvedValue(dataset),
    });
    const runRepo = makeRunRepo();
    const resultRepo = makeResultRepo();
    const provider = new MockAIProvider();
    const benchmarkEngine = new BenchmarkEngine(provider);

    const handler = new RunBenchmarkHandler(datasetRepo, runRepo, resultRepo, benchmarkEngine);

    const runId = await handler.execute({
      tenantId: 'tenant-1',
      datasetId: dataset.id,
      triggerType: 'MANUAL',
      createdBy: 'admin-1',
    });

    expect(runId).toBeDefined();
    expect(runRepo.save).toHaveBeenCalled();
    expect(resultRepo.saveMany).toHaveBeenCalledOnce();
  });

  it('DetectRegressionHandler detects regressions', async () => {
    const run = new BenchmarkRun({
      id: 'run-1',
      tenantId: 'tenant-1',
      datasetId: 'dataset-1',
      triggerType: 'MANUAL',
      status: 'COMPLETED',
      agreementRate: new AgreementRate(0.7), // falls below threshold
      calibrationAccuracy: new CalibrationAccuracy(0.8),
      avgScoreDifference: 0.25,
      falsePositiveRate: 0.05,
      falseNegativeRate: 0.15,
      createdBy: 'admin-1',
    });

    const runRepo = makeRunRepo({
      findById: vi.fn().mockResolvedValue(run),
    });
    const regressionRepo = makeRegressionRepo();
    const regressionEngine = new RegressionDetectionEngine();

    const handler = new DetectRegressionHandler(runRepo, regressionRepo, regressionEngine);

    const regressions = await handler.execute({
      tenantId: 'tenant-1',
      runId: 'run-1',
    });

    expect(regressions).toHaveLength(3);
    expect(regressionRepo.saveMany).toHaveBeenCalledOnce();
    expect(runRepo.save).toHaveBeenCalledOnce();
  });

  it('ApproveDeploymentHandler returns deployment decision', async () => {
    const run = new BenchmarkRun({
      id: 'run-1',
      tenantId: 'tenant-1',
      datasetId: 'dataset-1',
      triggerType: 'MANUAL',
      status: 'COMPLETED',
      agreementRate: new AgreementRate(0.85),
      calibrationAccuracy: new CalibrationAccuracy(0.8),
      avgScoreDifference: 0.05,
      falsePositiveRate: 0.02,
      falseNegativeRate: 0.03,
      createdBy: 'admin-1',
    });

    const runRepo = makeRunRepo({
      findById: vi.fn().mockResolvedValue(run),
    });
    const regressionRepo = makeRegressionRepo({
      findByRun: vi.fn().mockResolvedValue([]),
    });
    const decisionRepo = makeDecisionRepo();
    const decisionEngine = new DeploymentDecisionEngine();

    const handler = new ApproveDeploymentHandler(
      runRepo,
      regressionRepo,
      decisionRepo,
      decisionEngine
    );

    const decision = await handler.execute({
      tenantId: 'tenant-1',
      runId: 'run-1',
    });

    expect(decision.verdict).toBe('APPROVED');
    expect(decisionRepo.save).toHaveBeenCalledOnce();
  });
});
