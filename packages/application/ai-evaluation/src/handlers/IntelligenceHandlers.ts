import {
  AssessmentProfile,
  EvaluationRubric,
  AIEvaluationStandard,
  PromptTemplate,
  PromptVersionAggregate,
  GoldenDataset,
  GoldenDatasetItem,
  CalibrationSession,
  CalibrationItemResult,
  CalibrationEngine,
  CalibrationThresholds,
  CostAnalyticsEngine,
  EnrichedTelemetry,
  EvaluationQualityAnalytics,
  EvaluationQualityRecord,
  MultiVariantPromptExperiment,
  ExperimentVariant,
  VariantMetrics,
  AIProvider,
} from '@clasptek/domain-ai-evaluation';
import { PromptBuilderService } from '../services/PromptBuilderService';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════
// REPOSITORY CONTRACTS FOR INTELLIGENCE FRAMEWORK
// ═══════════════════════════════════════════════════════════════════

export interface GoldenDatasetRepository {
  findById(id: string): Promise<GoldenDataset | null>;
  findByCode(code: string): Promise<GoldenDataset | null>;
  save(dataset: GoldenDataset): Promise<void>;
}

export interface CalibrationSessionRepository {
  findById(id: string): Promise<CalibrationSession | null>;
  save(session: CalibrationSession): Promise<void>;
  findAll(): Promise<CalibrationSession[]>;
}

export interface PromptExperimentRepositoryV2 {
  findById(id: string): Promise<MultiVariantPromptExperiment | null>;
  save(experiment: MultiVariantPromptExperiment): Promise<void>;
}

export interface TelemetryRepository {
  saveTelemetry(telemetry: EnrichedTelemetry): Promise<void>;
  queryTelemetry(startDate: Date, endDate: Date): Promise<EnrichedTelemetry[]>;
  saveQualityRecord(record: EvaluationQualityRecord): Promise<void>;
  queryQualityRecords(): Promise<EvaluationQualityRecord[]>;
}

// ═══════════════════════════════════════════════════════════════════
// 1. RUN CALIBRATION SESSION HANDLER
// ═══════════════════════════════════════════════════════════════════

function resolveDatasetPath(datasetPath: string): string {
  if (path.isAbsolute(datasetPath) && fs.existsSync(datasetPath)) {
    return datasetPath;
  }
  let curr = process.cwd();
  while (curr && curr !== path.parse(curr).root) {
    const candidate = path.resolve(curr, datasetPath);
    if (fs.existsSync(candidate)) return candidate;
    curr = path.dirname(curr);
  }
  return path.resolve(process.cwd(), datasetPath);
}

export class RunCalibrationSessionHandler {
  constructor(
    private readonly sessionRepo: CalibrationSessionRepository,
    private readonly datasetRepo: GoldenDatasetRepository,
    private readonly promptBuilder: PromptBuilderService,
    private readonly calibrationEngine: CalibrationEngine
  ) {}

  public async execute(cmd: {
    datasetId: string;
    profile: AssessmentProfile;
    rubric: EvaluationRubric;
    standard: AIEvaluationStandard;
    template: PromptTemplate;
    version: PromptVersionAggregate | undefined;
    provider: AIProvider;
    thresholds: CalibrationThresholds;
  }): Promise<string> {
    const dataset = await this.datasetRepo.findById(cmd.datasetId);
    if (!dataset) {
      throw new Error(`GoldenDataset '${cmd.datasetId}' not found`);
    }

    // Initialize CalibrationSession
    const session = CalibrationSession.create({
      datasetId: dataset.id,
      assessmentProfileId: cmd.profile.id,
      ...(cmd.version?.id ? { promptVersionId: cmd.version.id } : {}),
      provider: cmd.provider.provider,
      model: cmd.provider.id,
    });

    session.start();

    try {
      // 1. Load golden dataset items from filesystem path
      const datasetFilePath = resolveDatasetPath(dataset.datasetPath);
      if (!fs.existsSync(datasetFilePath)) {
        throw new Error(`Golden dataset JSON file not found at path: ${dataset.datasetPath}`);
      }

      const fileContent = fs.readFileSync(datasetFilePath, 'utf8');
      const items: GoldenDatasetItem[] = JSON.parse(fileContent);

      let totalTokensUsed = 0;
      let totalCostUsd = 0;

      // 2. Score each item
      for (const item of items) {
        // Compile prompt using PromptBuilder v2
        const compiled = this.promptBuilder.buildPromptFromProfile(
          cmd.profile,
          cmd.rubric,
          cmd.standard,
          cmd.template,
          cmd.version,
          {
            studentSubmission: item.content,
            questionText: 'Mock Question Context',
          }
        );

        // Execute via provider
        const startTime = Date.now();
        const response = await cmd.provider.evaluate!({
          systemPrompt: compiled.systemPrompt,
          userPrompt: compiled.userPrompt,
          temperature: compiled.temperature,
          maxTokens: compiled.maxTokens,
        });
        const latencyMs = Date.now() - startTime;

        // Parse response content
        const resultObject = JSON.parse(response.content);
        const observedScore = resultObject.overallBand ?? resultObject.score ?? 0;

        // Criteria details
        const criteriaObserved: Record<string, number> = {};
        if (resultObject.criteria) {
          Object.entries(resultObject.criteria).forEach(([code, detail]: [string, any]) => {
            criteriaObserved[code] = typeof detail === 'number' ? detail : (detail.score ?? 0);
          });
        }

        const tokenUsage = response.tokenUsage ?? {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };
        const costEstimate = cmd.provider.estimateCost(
          tokenUsage.promptTokens,
          tokenUsage.completionTokens
        );

        totalTokensUsed += tokenUsage.totalTokens;
        totalCostUsd += costEstimate.costUsd;

        // Add item result to session
        session.addResult(
          new CalibrationItemResult({
            itemId: item.id,
            expectedScore: item.officialScore,
            observedScore,
            error: observedScore - item.officialScore,
            criteriaExpected: item.criteria,
            criteriaObserved,
            confidence: resultObject.confidence ?? 0.9,
            latencyMs,
          })
        );
      }

      // 3. Compute calibration summary & complete session
      const summary = this.calibrationEngine.generateSummary(session, cmd.thresholds, {
        totalTokensUsed,
        costUsd: totalCostUsd,
      });

      session.complete(summary);
      await this.sessionRepo.save(session);

      return session.id;
    } catch (error: any) {
      session.fail(error.message);
      await this.sessionRepo.save(session);
      throw error;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. EXECUTE PROMPT EXPERIMENT HANDLER
// ═══════════════════════════════════════════════════════════════════

export class ExecutePromptExperimentHandler {
  constructor(
    private readonly experimentRepo: PromptExperimentRepositoryV2,
    private readonly datasetRepo: GoldenDatasetRepository,
    private readonly promptBuilder: PromptBuilderService,
    private readonly calibrationEngine: CalibrationEngine
  ) {}

  public async execute(cmd: {
    experimentCode: string;
    assessmentType: string;
    skillCode: string;
    datasetId: string;
    variants: Array<{ promptVersion: PromptVersionAggregate; label: string }>;
    profile: AssessmentProfile;
    rubric: EvaluationRubric;
    standard: AIEvaluationStandard;
    template: PromptTemplate;
    provider: AIProvider;
  }): Promise<string> {
    const dataset = await this.datasetRepo.findById(cmd.datasetId);
    if (!dataset) {
      throw new Error(`GoldenDataset '${cmd.datasetId}' not found`);
    }

    const experiment = MultiVariantPromptExperiment.create({
      experimentCode: cmd.experimentCode,
      assessmentType: cmd.assessmentType,
      skillCode: cmd.skillCode,
      datasetId: dataset.id,
    });

    // Add variants to experiment
    const resolvedVariants: ExperimentVariant[] = cmd.variants.map((v, idx) => {
      const variant = new ExperimentVariant({
        variantId: `variant-${idx + 1}`,
        promptVersionId: v.promptVersion.id,
        label: v.label,
      });
      experiment.addVariant(variant);
      return variant;
    });

    experiment.start();

    // 1. Load golden dataset items from filesystem path
    const datasetFilePath = resolveDatasetPath(dataset.datasetPath);
    if (!fs.existsSync(datasetFilePath)) {
      throw new Error(`Golden dataset JSON file not found at path: ${dataset.datasetPath}`);
    }

    const fileContent = fs.readFileSync(datasetFilePath, 'utf8');
    const items: GoldenDatasetItem[] = JSON.parse(fileContent);

    // 2. Run evaluations for each variant across all dataset items
    for (const variant of resolvedVariants) {
      const matchingInput = cmd.variants.find(
        (v) => v.promptVersion.id === variant.promptVersionId
      )!;

      // Temporary CalibrationSession to reuse CalibrationEngine logic
      const tempSession = CalibrationSession.create({
        datasetId: dataset.id,
        assessmentProfileId: cmd.profile.id,
        promptVersionId: variant.promptVersionId,
        provider: cmd.provider.provider,
        model: cmd.provider.id,
      });
      tempSession.start();

      let totalTokensUsed = 0;
      let totalCostUsd = 0;

      for (const item of items) {
        // Compile prompt
        const compiled = this.promptBuilder.buildPromptFromProfile(
          cmd.profile,
          cmd.rubric,
          cmd.standard,
          cmd.template,
          matchingInput.promptVersion,
          {
            studentSubmission: item.content,
            questionText: 'Mock Question Context',
          }
        );

        // Execute via provider
        const startTime = Date.now();
        const response = await cmd.provider.evaluate!({
          systemPrompt: compiled.systemPrompt,
          userPrompt: compiled.userPrompt,
          temperature: compiled.temperature,
          maxTokens: compiled.maxTokens,
        });
        const latencyMs = Date.now() - startTime;

        // Parse response content
        const resultObject = JSON.parse(response.content);
        const observedScore = resultObject.overallBand ?? resultObject.score ?? 0;

        // Criteria details
        const criteriaObserved: Record<string, number> = {};
        if (resultObject.criteria) {
          Object.entries(resultObject.criteria).forEach(([code, detail]: [string, any]) => {
            criteriaObserved[code] = typeof detail === 'number' ? detail : (detail.score ?? 0);
          });
        }

        const tokenUsage = response.tokenUsage ?? {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };
        const costEstimate = cmd.provider.estimateCost(
          tokenUsage.promptTokens,
          tokenUsage.completionTokens
        );

        totalTokensUsed += tokenUsage.totalTokens;
        totalCostUsd += costEstimate.costUsd;

        tempSession.addResult(
          new CalibrationItemResult({
            itemId: item.id,
            expectedScore: item.officialScore,
            observedScore,
            error: observedScore - item.officialScore,
            criteriaExpected: item.criteria,
            criteriaObserved,
            confidence: resultObject.confidence ?? 0.9,
            latencyMs,
          })
        );
      }

      // Compute statistics using CalibrationEngine
      const averageDeviation = this.calibrationEngine.computeOverallDeviation(tempSession);
      const rmse = this.calibrationEngine.computeRMSE(tempSession);
      const averageLatencyMs =
        tempSession.results.reduce(
          (sum: number, r: CalibrationItemResult) => sum + r.latencyMs,
          0
        ) / tempSession.results.length;

      experiment.recordResult(
        new VariantMetrics({
          variantId: variant.variantId,
          averageDeviation,
          rootMeanSquaredError: rmse,
          scoringVariance: Math.pow(rmse, 2), // variance estimation
          averageLatencyMs,
          totalTokens: totalTokensUsed,
          totalCostUsd,
        })
      );
    }

    // 3. Select winner based on lowest average deviation (Mean Absolute Error)
    let winnerId = resolvedVariants[0].variantId;
    let lowestDeviation = Infinity;

    for (const result of experiment.results) {
      if (result.averageDeviation < lowestDeviation) {
        lowestDeviation = result.averageDeviation;
        winnerId = result.variantId;
      }
    }

    experiment.complete(winnerId);
    await this.experimentRepo.save(experiment);

    return experiment.id;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. GET COST ANALYTICS HANDLER
// ═══════════════════════════════════════════════════════════════════

export class GetCostAnalyticsHandler {
  constructor(
    private readonly telemetryRepo: TelemetryRepository,
    private readonly costAnalytics: CostAnalyticsEngine
  ) {}

  public async execute(cmd: { startDate: Date; endDate: Date }) {
    const telemetry = await this.telemetryRepo.queryTelemetry(cmd.startDate, cmd.endDate);
    return this.costAnalytics.aggregatePeriod(telemetry, cmd.startDate, cmd.endDate);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. GET QUALITY ANALYTICS HANDLER
// ═══════════════════════════════════════════════════════════════════

export class GetQualityAnalyticsHandler {
  constructor(
    private readonly telemetryRepo: TelemetryRepository,
    private readonly qualityAnalytics: EvaluationQualityAnalytics,
    private readonly sessionRepo: CalibrationSessionRepository
  ) {}

  public async execute(cmd: { assessmentType?: string }) {
    // 1. Query quality records and aggregate metrics
    const records = await this.telemetryRepo.queryQualityRecords();
    const metrics = this.qualityAnalytics.aggregateQuality(records, cmd.assessmentType);

    // 2. Query calibration session history to compute trend
    const sessions = await this.sessionRepo.findAll();
    const validSessions = sessions
      .filter((s) => s.summary !== undefined)
      .map((s) => ({
        startedAt: s.startedAt,
        id: s.id,
        summary: {
          averageDeviation: s.summary!.averageDeviation,
          averageConfidence: s.summary!.averageConfidence,
          compliancePassed: s.summary!.compliancePassed,
        },
      }));
    const trend = this.qualityAnalytics.computeCalibrationTrend(validSessions);

    return {
      metrics,
      trend,
    };
  }
}
