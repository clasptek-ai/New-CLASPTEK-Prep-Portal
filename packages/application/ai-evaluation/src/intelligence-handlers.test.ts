import { describe, it, expect } from 'vitest';
import {
  AssessmentProfile,
  IELTS_ASSESSMENT,
  BaseEvaluationRubric,
  RubricCriterionDescriptor,
  AIEvaluationStandard,
  PromptTemplate,
  PromptVersionAggregate,
  PromptHash,
  GoldenDataset,
  CalibrationSession,
  CalibrationEngine,
  CostAnalyticsEngine,
  EvaluationQualityAnalytics,
  MockAIProvider,
  MultiVariantPromptExperiment,
} from '@clasptek/domain-ai-evaluation';
import {
  PromptBuilderService,
  RunCalibrationSessionHandler,
  ExecutePromptExperimentHandler,
  GetCostAnalyticsHandler,
  GetQualityAnalyticsHandler,
  GoldenDatasetRepository,
  CalibrationSessionRepository,
  PromptExperimentRepositoryV2,
  TelemetryRepository,
} from './index';

// ─── Test Fixtures & Mocks ──────────────────────────────────────────

class MockRubric extends BaseEvaluationRubric {
  readonly rubricCode = 'ielts-wt2-rubric';
  readonly assessmentType = 'IELTS';
  readonly skillCode = 'WRITING_TASK_2';
  readonly criteria: RubricCriterionDescriptor[] = [
    {
      code: 'TASK_RESPONSE',
      name: 'Task Response',
      weight: 0.5,
      bandDescriptors: new Map([[7, 'Fully addresses prompt']]),
    },
    {
      code: 'COHERENCE',
      name: 'Coherence',
      weight: 0.5,
      bandDescriptors: new Map([[7, 'Logically organized']]),
    },
  ];
}

const mockStandard = AIEvaluationStandard.create({
  version: '1.0',
  displayName: 'Standard 1.0',
  outputSchema: { type: 'object' },
  jsonRules: ['Return JSON only'],
});

const mockTemplate = PromptTemplate.create({
  templateCode: 'ielts-wt2-template',
  assessmentType: 'IELTS',
  skillCode: 'WRITING_TASK_2',
  displayName: 'IELTS Task 2 Template',
  systemPrompt: 'You are an IELTS essay grader.',
  userPromptTemplate: 'Question: {{questionText}}\nEssay: {{studentSubmission}}',
  placeholders: ['questionText', 'studentSubmission'],
});

const mockProfile = AssessmentProfile.create({
  assessmentType: IELTS_ASSESSMENT,
  skillCode: 'WRITING',
  promptTemplateCode: 'ielts-wt2-template',
  rubricCode: 'ielts-wt2-rubric',
  evaluationStandardId: mockStandard.id,
  provider: 'MOCK',
});

const mockDataset = GoldenDataset.create({
  datasetCode: 'ds-wt2-test',
  assessmentType: 'IELTS',
  skillCode: 'WRITING_TASK_2',
  displayName: 'IELTS Task 2 Dataset',
  datasetPath: 'datasets/ielts/writing-task2/benchmark-dataset.json',
});
mockDataset.setItemCount(2);

describe('Sprint 3.8 — Application Intelligence Services & Handlers', () => {
  it('PromptBuilderService v2 compiles prompt from assessment profile', () => {
    const builder = new PromptBuilderService();
    const rubric = new MockRubric();

    const compiled = builder.buildPromptFromProfile(
      mockProfile,
      rubric,
      mockStandard,
      mockTemplate,
      undefined,
      {
        questionText: 'Is remote work good?',
        studentSubmission: 'I think remote work is good.',
      }
    );

    expect(compiled.systemPrompt).toContain('You are an IELTS essay grader.');
    expect(compiled.systemPrompt).toContain('Return JSON only');
    expect(compiled.systemPrompt).toContain('Task Response');
    expect(compiled.userPrompt).toContain('Is remote work good?');
    expect(compiled.userPrompt).toContain('I think remote work is good.');
    expect(compiled.temperature).toBe(0.3);
  });

  it('RunCalibrationSessionHandler executes a calibration session end-to-end', async () => {
    const builder = new PromptBuilderService();
    const engine = new CalibrationEngine();
    const provider = new MockAIProvider();

    const savedSessions: CalibrationSession[] = [];
    const mockSessionRepo: CalibrationSessionRepository = {
      findById: async () => null,
      save: async (session) => {
        savedSessions.push(session);
      },
      findAll: async () => savedSessions,
    };

    const mockDatasetRepo: GoldenDatasetRepository = {
      findById: async () => mockDataset,
      findByCode: async () => mockDataset,
      save: async () => {},
    };

    const handler = new RunCalibrationSessionHandler(
      mockSessionRepo,
      mockDatasetRepo,
      builder,
      engine
    );

    const sessionId = await handler.execute({
      datasetId: mockDataset.id,
      profile: mockProfile,
      rubric: new MockRubric(),
      standard: mockStandard,
      template: mockTemplate,
      version: undefined,
      provider,
      thresholds: {
        maxAverageDeviation: 1.0,
        maxRMSE: 1.0,
        minConfidence: 0.7,
      },
    });

    expect(sessionId).toBeDefined();
    expect(savedSessions.length).toBeGreaterThan(0);
    const lastSession = savedSessions[savedSessions.length - 1];
    expect(lastSession.status).toBe('COMPLETED');
    expect(lastSession.summary).toBeDefined();
    expect(lastSession.results).toHaveLength(2);
  });

  it('ExecutePromptExperimentHandler executes A/B/C/D experiments and resolves winner', async () => {
    const builder = new PromptBuilderService();
    const engine = new CalibrationEngine();
    const provider = new MockAIProvider();

    const savedExperiments: MultiVariantPromptExperiment[] = [];
    const mockExperimentRepo: PromptExperimentRepositoryV2 = {
      findById: async () => null,
      save: async (exp) => {
        savedExperiments.push(exp);
      },
    };

    const mockDatasetRepo: GoldenDatasetRepository = {
      findById: async () => mockDataset,
      findByCode: async () => mockDataset,
      save: async () => {},
    };

    const handler = new ExecutePromptExperimentHandler(
      mockExperimentRepo,
      mockDatasetRepo,
      builder,
      engine
    );

    const version1 = new PromptVersionAggregate({
      id: 'ver-1',
      templateId: mockTemplate.id,
      version: '1.0.0',
      provider: 'MOCK',
      schemaVersion: '1.0',
      systemPrompt: 'System prompt 1',
      userPromptTemplate: 'User template 1',
      temperature: 0.2,
      topP: 0.9,
      maxTokens: 2000,
      promptHash: new PromptHash('hash1'),
    });

    const version2 = new PromptVersionAggregate({
      id: 'ver-2',
      templateId: mockTemplate.id,
      version: '2.0.0',
      provider: 'MOCK',
      schemaVersion: '1.0',
      systemPrompt: 'System prompt 2',
      userPromptTemplate: 'User template 2',
      temperature: 0.4,
      topP: 0.95,
      maxTokens: 2000,
      promptHash: new PromptHash('hash2'),
    });

    const experimentId = await handler.execute({
      experimentCode: 'exp-v1-vs-v2',
      assessmentType: 'IELTS',
      skillCode: 'WRITING_TASK_2',
      datasetId: mockDataset.id,
      variants: [
        { promptVersion: version1, label: 'Variant A' },
        { promptVersion: version2, label: 'Variant B' },
      ],
      profile: mockProfile,
      rubric: new MockRubric(),
      standard: mockStandard,
      template: mockTemplate,
      provider,
    });

    expect(experimentId).toBeDefined();
    expect(savedExperiments).toHaveLength(1);

    const exp = savedExperiments[0];
    expect(exp.status).toBe('COMPLETED');
    expect(exp.winnerVariantId).toBeDefined();
    expect(exp.results).toHaveLength(2);
  });

  it('GetCostAnalyticsHandler queries aggregated cost statistics', async () => {
    const costEngine = new CostAnalyticsEngine();
    const startDate = new Date('2026-07-01');
    const endDate = new Date('2026-07-31');

    const mockTelemetryRepo: TelemetryRepository = {
      saveTelemetry: async () => {},
      queryTelemetry: async () => [
        {
          latencyMs: 150,
          provider: 'MOCK',
          model: 'mock-model',
          inputTokens: 100,
          outputTokens: 50,
          costUsd: 0.001,
          attempts: 1,
          status: 'COMPLETED',
          assessmentType: 'IELTS',
          skillCode: 'WRITING',
          timestamp: new Date('2026-07-15'),
        },
      ],
      saveQualityRecord: async () => {},
      queryQualityRecords: async () => [],
    };

    const handler = new GetCostAnalyticsHandler(mockTelemetryRepo, costEngine);
    const summary = await handler.execute({ startDate, endDate });

    expect(summary.totalCalls).toBe(1);
    expect(summary.totalCostUsd).toBe(0.001);
  });

  it('GetQualityAnalyticsHandler queries aggregated quality metrics and calibration trend', async () => {
    const qualityAnalytics = new EvaluationQualityAnalytics();
    const mockTelemetryRepo: TelemetryRepository = {
      saveTelemetry: async () => {},
      queryTelemetry: async () => [],
      saveQualityRecord: async () => {},
      queryQualityRecords: async () => [
        {
          id: 'q1',
          assessmentType: 'IELTS',
          skillCode: 'WRITING',
          timestamp: new Date(),
          jsonParseFailed: false,
          schemaValidationFailed: false,
          parserFailed: false,
          hallucinationDetected: false,
          confidenceScore: 0.9,
          latencyMs: 100,
        },
      ],
    };

    const mockSessionRepo: CalibrationSessionRepository = {
      findById: async () => null,
      save: async () => {},
      findAll: async () => [],
    };

    const handler = new GetQualityAnalyticsHandler(
      mockTelemetryRepo,
      qualityAnalytics,
      mockSessionRepo
    );

    const result = await handler.execute({ assessmentType: 'IELTS' });
    expect(result.metrics).toHaveLength(1);
    expect(result.metrics[0].averageConfidence).toBe(0.9);
  });
});
