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
  PromptComparisonEngine,
  BenchmarkEngine,
  RegressionDetectionEngine,
  DeploymentDecisionEngine,
  type ExperimentTrigger,
  type BenchmarkTriggerType,
} from '@clasptek/domain-ai-evaluation';

// ───────────────────────────────────────────────────────────────────
// SECTION 1: REPOSITORY CONTRACTS
// ───────────────────────────────────────────────────────────────────

export interface PromptExperimentRepository {
  save(experiment: PromptExperiment): Promise<void>;
  findById(id: string): Promise<PromptExperiment | null>;
  findAll(tenantId: string): Promise<PromptExperiment[]>;
}

export interface PromptComparisonRepository {
  save(comparison: PromptComparison): Promise<void>;
  saveMany(comparisons: PromptComparison[]): Promise<void>;
  findByExperiment(experimentId: string): Promise<PromptComparison[]>;
}

export interface PromptPerformanceRepository {
  save(metric: PromptPerformanceMetric): Promise<void>;
  findByExperiment(experimentId: string): Promise<PromptPerformanceMetric | null>;
  findByVersion(versionId: string): Promise<PromptPerformanceMetric[]>;
}

export interface BenchmarkDatasetRepository {
  save(dataset: BenchmarkDataset): Promise<void>;
  findById(id: string): Promise<BenchmarkDataset | null>;
  findAll(tenantId: string): Promise<BenchmarkDataset[]>;
  saveItem(item: BenchmarkDatasetItem): Promise<void>;
}

export interface BenchmarkRunRepository {
  save(run: BenchmarkRun): Promise<void>;
  findById(id: string): Promise<BenchmarkRun | null>;
  findAll(tenantId: string): Promise<BenchmarkRun[]>;
  findLatest(tenantId: string, datasetId: string): Promise<BenchmarkRun | null>;
}

export interface BenchmarkResultRepository {
  save(result: BenchmarkResult): Promise<void>;
  saveMany(results: BenchmarkResult[]): Promise<void>;
  findByRun(runId: string): Promise<BenchmarkResult[]>;
}

export interface BenchmarkRegressionRepository {
  save(regression: BenchmarkRegression): Promise<void>;
  saveMany(regressions: BenchmarkRegression[]): Promise<void>;
  findByRun(runId: string): Promise<BenchmarkRegression[]>;
  findAll(tenantId: string): Promise<BenchmarkRegression[]>;
}

export interface DeploymentDecisionRepository {
  save(decision: DeploymentDecision): Promise<void>;
  findByRun(runId: string): Promise<DeploymentDecision | null>;
  findByExperiment(experimentId: string): Promise<DeploymentDecision | null>;
}

// ───────────────────────────────────────────────────────────────────
// SECTION 2: COMMANDS & HANDLERS
// ───────────────────────────────────────────────────────────────────

export interface RegisterPromptVersionCommand {
  tenantId: string;
  templateId: string;
  versionNumber: number;
  systemPrompt: string;
  userPromptTemplate: string;
  createdBy: string;
}

export class RegisterPromptVersionHandler {
  constructor(_promptVersionRepo?: any) {}

  public async execute(cmd: RegisterPromptVersionCommand): Promise<string> {
    // Simulated prompt registration logic, registers a new prompt template version.
    return `pv-${cmd.templateId}-${cmd.versionNumber}`;
  }
}

export interface ComparePromptVersionsCommand {
  tenantId: string;
  experimentName: string;
  baselineVersionId: string;
  candidateVersionId: string;
  triggerReason: ExperimentTrigger;
  createdBy: string;
  samples: Array<{
    submissionId: string;
    questionType: string;
    humanScore: number;
    baselineScore: number;
    baselineConfidence: number;
    baselineLatencyMs: number;
    baselineCostUsd: number;
    candidateScore: number;
    candidateConfidence: number;
    candidateLatencyMs: number;
    candidateCostUsd: number;
    instructorOverrode: boolean;
    instructorOverrideScore?: number;
  }>;
}

export class ComparePromptVersionsHandler {
  constructor(
    private readonly experimentRepo: PromptExperimentRepository,
    private readonly comparisonRepo: PromptComparisonRepository,
    private readonly performanceRepo: PromptPerformanceRepository,
    private readonly comparisonEngine: PromptComparisonEngine
  ) {}

  public async execute(cmd: ComparePromptVersionsCommand): Promise<string> {
    const experiment = PromptExperiment.create({
      tenantId: cmd.tenantId,
      name: cmd.experimentName,
      baselineVersionId: cmd.baselineVersionId,
      candidateVersionId: cmd.candidateVersionId,
      triggerReason: cmd.triggerReason,
      createdBy: cmd.createdBy,
    });

    experiment.start();

    const result = this.comparisonEngine.compare({
      experimentId: experiment.id,
      promptVersionId: cmd.candidateVersionId,
      samples: cmd.samples,
    });

    for (const comp of result.comparisons) {
      experiment.addComparison(comp);
    }

    experiment.complete(result.metrics);

    await this.experimentRepo.save(experiment);
    await this.comparisonRepo.saveMany(result.comparisons);
    await this.performanceRepo.save(result.metrics);

    return experiment.id;
  }
}

export interface RunBenchmarkCommand {
  tenantId: string;
  datasetId: string;
  triggerType: BenchmarkTriggerType;
  createdBy: string;
  promptVersionId?: string;
  rubricVersion?: string;
  modelVersion?: string;
  modelCode?: string;
  provider?: string;
}

export class RunBenchmarkHandler {
  constructor(
    private readonly datasetRepo: BenchmarkDatasetRepository,
    private readonly runRepo: BenchmarkRunRepository,
    private readonly resultRepo: BenchmarkResultRepository,
    private readonly benchmarkEngine: BenchmarkEngine
  ) {}

  public async execute(cmd: RunBenchmarkCommand): Promise<string> {
    const dataset = await this.datasetRepo.findById(cmd.datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${cmd.datasetId}`);
    }

    const run = BenchmarkRun.create({
      tenantId: cmd.tenantId,
      datasetId: cmd.datasetId,
      triggerType: cmd.triggerType,
      createdBy: cmd.createdBy,
      promptVersionId: cmd.promptVersionId,
      rubricVersion: cmd.rubricVersion,
      modelVersion: cmd.modelVersion,
      modelCode: cmd.modelCode,
      provider: cmd.provider,
    });

    await this.runRepo.save(run);

    const summary = await this.benchmarkEngine.execute({
      run,
      dataset,
      buildPrompt: () => ({ systemPrompt: 'sys', userPrompt: 'user' }),
      parseScore: () => ({ score: 7.0, confidence: 0.9 }),
    });

    await this.runRepo.save(run);
    await this.resultRepo.saveMany(summary.results);

    return run.id;
  }
}

export interface DetectRegressionCommand {
  tenantId: string;
  runId: string;
  baselineRunId?: string;
}

export class DetectRegressionHandler {
  constructor(
    private readonly runRepo: BenchmarkRunRepository,
    private readonly regressionRepo: BenchmarkRegressionRepository,
    private readonly regressionEngine: RegressionDetectionEngine
  ) {}

  public async execute(cmd: DetectRegressionCommand): Promise<BenchmarkRegression[]> {
    const run = await this.runRepo.findById(cmd.runId);
    if (!run) throw new Error(`BenchmarkRun not found: ${cmd.runId}`);

    let baseline: BenchmarkRun | null = null;
    if (cmd.baselineRunId) {
      baseline = await this.runRepo.findById(cmd.baselineRunId);
    }

    const regressions = this.regressionEngine.detect({
      runId: run.id,
      current: {
        agreementRate: run.agreementRate?.rate ?? 0,
        calibrationAccuracy: run.calibrationAccuracy?.value ?? 0,
        avgScoreDifference: run.avgScoreDifference ?? 0,
        falsePositiveRate: run.falsePositiveRate ?? 0,
        falseNegativeRate: run.falseNegativeRate ?? 0,
        avgLatencyMs: run.averageLatency?.avgMs ?? 0,
        totalCostUsd: run.evaluationCost?.totalUsd ?? 0,
      },
      baseline: baseline
        ? {
            agreementRate: baseline.agreementRate?.rate ?? 0,
            calibrationAccuracy: baseline.calibrationAccuracy?.value ?? 0,
            avgScoreDifference: baseline.avgScoreDifference ?? 0,
            falsePositiveRate: baseline.falsePositiveRate ?? 0,
            falseNegativeRate: baseline.falseNegativeRate ?? 0,
            avgLatencyMs: baseline.averageLatency?.avgMs ?? 0,
            totalCostUsd: baseline.evaluationCost?.totalUsd ?? 0,
          }
        : undefined,
    });

    for (const reg of regressions) {
      run.addRegression(reg);
    }

    await this.runRepo.save(run);
    await this.regressionRepo.saveMany(regressions);

    return regressions;
  }
}

export interface ApproveDeploymentCommand {
  tenantId: string;
  runId: string;
  experimentId?: string;
  decidedBy?: string;
}

export class ApproveDeploymentHandler {
  constructor(
    private readonly runRepo: BenchmarkRunRepository,
    private readonly regressionRepo: BenchmarkRegressionRepository,
    private readonly decisionRepo: DeploymentDecisionRepository,
    private readonly decisionEngine: DeploymentDecisionEngine
  ) {}

  public async execute(cmd: ApproveDeploymentCommand): Promise<DeploymentDecision> {
    const run = await this.runRepo.findById(cmd.runId);
    if (!run) throw new Error(`BenchmarkRun not found: ${cmd.runId}`);

    const regressions = await this.regressionRepo.findByRun(run.id);

    const decision = this.decisionEngine.decide({
      tenantId: cmd.tenantId,
      runId: run.id,
      experimentId: cmd.experimentId,
      agreementRate: run.agreementRate?.rate ?? 0,
      calibrationAccuracy: run.calibrationAccuracy?.value ?? 0,
      regressions,
    });

    await this.decisionRepo.save(decision);

    return decision;
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 3: QUERY HANDLERS & DTOs
// ───────────────────────────────────────────────────────────────────

export class GetPromptPerformanceHandler {
  constructor(private readonly performanceRepo: PromptPerformanceRepository) {}

  public async execute(experimentId: string): Promise<PromptPerformanceMetric | null> {
    return this.performanceRepo.findByExperiment(experimentId);
  }
}

export class GetPromptComparisonHandler {
  constructor(private readonly comparisonRepo: PromptComparisonRepository) {}

  public async execute(experimentId: string): Promise<PromptComparison[]> {
    return this.comparisonRepo.findByExperiment(experimentId);
  }
}

export class GetBenchmarkRunsHandler {
  constructor(private readonly runRepo: BenchmarkRunRepository) {}

  public async execute(tenantId: string): Promise<BenchmarkRun[]> {
    return this.runRepo.findAll(tenantId);
  }
}

export class GetBenchmarkResultsHandler {
  constructor(private readonly resultRepo: BenchmarkResultRepository) {}

  public async execute(runId: string): Promise<BenchmarkResult[]> {
    return this.resultRepo.findByRun(runId);
  }
}

export class GetRegressionHistoryHandler {
  constructor(private readonly regressionRepo: BenchmarkRegressionRepository) {}

  public async execute(tenantId: string): Promise<BenchmarkRegression[]> {
    return this.regressionRepo.findAll(tenantId);
  }
}

export class GetDeploymentDecisionHandler {
  constructor(private readonly decisionRepo: DeploymentDecisionRepository) {}

  public async execute(runId: string): Promise<DeploymentDecision | null> {
    return this.decisionRepo.findByRun(runId);
  }
}

// ───────────────────────────────────────────────────────────────────
// SECTION 4: ORCHESTRATORS
// ───────────────────────────────────────────────────────────────────

export class PromptComparisonOrchestrator {
  constructor(private readonly compareHandler: ComparePromptVersionsHandler) {}

  public async orchestrate(cmd: ComparePromptVersionsCommand): Promise<string> {
    return this.compareHandler.execute(cmd);
  }
}

export class BenchmarkOrchestrator {
  constructor(private readonly runHandler: RunBenchmarkHandler) {}

  public async orchestrate(cmd: RunBenchmarkCommand): Promise<string> {
    return this.runHandler.execute(cmd);
  }
}

export class RegressionOrchestrator {
  constructor(private readonly detectHandler: DetectRegressionHandler) {}

  public async orchestrate(cmd: DetectRegressionCommand): Promise<BenchmarkRegression[]> {
    return this.detectHandler.execute(cmd);
  }
}

export class DeploymentApprovalOrchestrator {
  constructor(private readonly approveHandler: ApproveDeploymentHandler) {}

  public async orchestrate(cmd: ApproveDeploymentCommand): Promise<DeploymentDecision> {
    return this.approveHandler.execute(cmd);
  }
}
