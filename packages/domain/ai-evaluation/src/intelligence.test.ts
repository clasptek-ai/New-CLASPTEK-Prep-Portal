import { describe, it, expect } from 'vitest';
import {
  AssessmentType,
  AssessmentCapability,
  ScoringScale,
  IELTS_ASSESSMENT,
  TOEFL_ASSESSMENT,
  CELPIP_ASSESSMENT,
  SAT_ASSESSMENT,
  ENGLISH_PROFICIENCY_ASSESSMENT,
  ALL_ASSESSMENT_TYPES,
  AssessmentProfile,
  BaseEvaluationRubric,
  RubricCriterionDescriptor,
  AIEvaluationStandard,
  AssessmentRegistry,
  PromptCatalog,
  PromptTemplate,
  PromptGovernance,
  CalibrationSession,
  CalibrationItemResult,
  CalibrationEngine,
  CostAnalyticsEngine,
  EvaluationQualityAnalytics,
  EvaluationQualityRecord,
  MultiVariantPromptExperiment,
  ExperimentVariant,
  VariantMetrics,
} from './index';

describe('Sprint 3.8 — Assessment & Rubric Intelligence', () => {
  it('ScoringScale normalizes, rounds, and checks pass/fail correctly', () => {
    const scale = new ScoringScale({ min: 0, max: 9, step: 0.5, passingScore: 6.5 });
    expect(scale.normalize(4.5)).toBe(0.5);
    expect(scale.roundToStep(6.3)).toBe(6.5);
    expect(scale.isPassing(7.0)).toBe(true);
    expect(scale.isPassing(6.0)).toBe(false);
  });

  it('AssessmentCapability reports supported skills correctly', () => {
    const cap = new AssessmentCapability({
      supportsWriting: true,
      supportsSpeaking: true,
      supportsReading: false,
      supportsListening: false,
      supportsGrammar: false,
      supportsVocabulary: false,
    });
    expect(cap.supportedSkills()).toEqual(['WRITING', 'SPEAKING']);
    expect(cap.supportsSkill('WRITING')).toBe(true);
    expect(cap.supportsSkill('READING')).toBe(false);
  });

  it('Pre-defined AssessmentTypes have correct capabilities and scales', () => {
    expect(ALL_ASSESSMENT_TYPES.length).toBe(5);

    expect(IELTS_ASSESSMENT.code).toBe('IELTS');
    expect(IELTS_ASSESSMENT.scoringScale.max).toBe(9);
    expect(IELTS_ASSESSMENT.supportsSkill('WRITING')).toBe(true);

    expect(TOEFL_ASSESSMENT.code).toBe('TOEFL');
    expect(TOEFL_ASSESSMENT.scoringScale.max).toBe(30);

    expect(CELPIP_ASSESSMENT.code).toBe('CELPIP');
    expect(CELPIP_ASSESSMENT.scoringScale.max).toBe(12);

    expect(SAT_ASSESSMENT.code).toBe('SAT');
    expect(SAT_ASSESSMENT.scoringScale.max).toBe(800);

    expect(ENGLISH_PROFICIENCY_ASSESSMENT.code).toBe('ENGLISH_PROFICIENCY');
    expect(ENGLISH_PROFICIENCY_ASSESSMENT.supportsSkill('GRAMMAR')).toBe(true);
  });

  it('AssessmentProfile validates skills and providers upon creation', () => {
    const profile = AssessmentProfile.create({
      assessmentType: IELTS_ASSESSMENT,
      skillCode: 'WRITING',
      promptTemplateCode: 'ielts-writing-v1',
      rubricCode: 'ielts-writing-rubric',
      evaluationStandardId: 'std-v1',
      provider: 'GEMINI',
      confidenceThreshold: 0.85,
    });

    expect(profile.isActive).toBe(true);
    expect(profile.meetsConfidenceThreshold(0.9)).toBe(true);
    expect(profile.meetsConfidenceThreshold(0.8)).toBe(false);

    // Invalid skill should throw
    expect(() => {
      AssessmentProfile.create({
        assessmentType: SAT_ASSESSMENT,
        skillCode: 'SPEAKING', // SAT does not support speaking
        promptTemplateCode: 'sat-speaking',
        rubricCode: 'sat-rubric',
        evaluationStandardId: 'std-v1',
        provider: 'GEMINI',
      });
    }).toThrow(/does not support skill/);
  });

  it('BaseEvaluationRubric generates instructions and validates responses', () => {
    class TestRubric extends BaseEvaluationRubric {
      readonly rubricCode = 'test-rubric-v1';
      readonly assessmentType = 'IELTS';
      readonly skillCode = 'WRITING';
      readonly criteria: RubricCriterionDescriptor[] = [
        {
          code: 'TASK_RESPONSE',
          name: 'Task Response',
          weight: 0.5,
          bandDescriptors: new Map([
            [6, 'Addresses all parts of the prompt'],
            [7, 'Covers all requirements fully'],
          ]),
        },
        {
          code: 'COHERENCE',
          name: 'Coherence & Cohesion',
          weight: 0.5,
          bandDescriptors: new Map([
            [6, 'Arranges information coherently'],
            [7, 'Logically organizes information'],
          ]),
        },
      ];
    }

    const rubric = new TestRubric();
    expect(rubric.getCriteriaCodes()).toEqual(['TASK_RESPONSE', 'COHERENCE']);
    expect(rubric.getCriterionDescriptor('TASK_RESPONSE', 7)).toBe('Covers all requirements fully');

    const instructions = rubric.generateEvaluationInstructions();
    expect(instructions).toContain('Evaluation Rubric: test-rubric-v1');
    expect(instructions).toContain('TASK_RESPONSE');

    const validResponse = rubric.validateResponse({
      TASK_RESPONSE: 7,
      COHERENCE: 7,
    });
    expect(validResponse.isValid).toBe(true);

    const invalidResponse = rubric.validateResponse({
      TASK_RESPONSE: 7,
    });
    expect(invalidResponse.isValid).toBe(false);
    expect(invalidResponse.missingCriteria).toEqual(['COHERENCE']);
  });

  it('AIEvaluationStandard compiles rules correctly', () => {
    const std = AIEvaluationStandard.create({
      version: '1.0',
      displayName: 'Standard V1',
      outputSchema: { type: 'object' },
      jsonRules: ['Must return valid JSON', 'No markdown ticks around JSON'],
      scoringRules: ['Round overall band to nearest 0.5'],
    });

    std.activate();
    expect(std.isActive).toBe(true);

    const rules = std.compileRules();
    expect(rules).toContain('JSON Output Rules');
    expect(rules).toContain('Must return valid JSON');
    expect(rules).toContain('Scoring Rules');
  });

  it('AssessmentRegistry manages registrations and validates assessment completeness', () => {
    const registry = new AssessmentRegistry();

    const singleSkillAssessment = new AssessmentType({
      code: 'SINGLE_SKILL_TEST',
      displayName: 'Single Skill Test',
      providerSupport: ['GEMINI'],
      capabilities: new AssessmentCapability({
        supportsWriting: true,
        supportsSpeaking: false,
        supportsReading: false,
        supportsListening: false,
        supportsGrammar: false,
        supportsVocabulary: false,
      }),
      scoringScale: new ScoringScale({ min: 0, max: 10, step: 1 }),
      rubricFamily: 'TEST',
    });

    const entry = {
      assessmentType: singleSkillAssessment,
      capabilities: singleSkillAssessment.capabilities,
      profiles: [
        AssessmentProfile.create({
          assessmentType: singleSkillAssessment,
          skillCode: 'WRITING',
          promptTemplateCode: 'test-writing-v1',
          rubricCode: 'test-writing-rubric',
          evaluationStandardId: 'std-1',
          provider: 'GEMINI',
        }),
      ],
      rubricCodes: ['test-writing-rubric'],
      promptCatalogCodes: ['test-writing-v1'],
      datasetPaths: ['datasets/test/writing/dataset.json'],
      activeVersions: new Map([['WRITING', 'ver-1']]),
    };

    registry.register(entry);
    expect(registry.isRegistered('SINGLE_SKILL_TEST')).toBe(true);
    expect(registry.count).toBe(1);

    // Completeness validation
    const completeness = registry.validateAssessment('SINGLE_SKILL_TEST', {
      rubrics: [{ rubricCode: 'test-writing-rubric' }],
      templates: [
        {
          templateCode: 'test-writing-v1',
          versions: [{ id: 'ver-1', isCurrent: true }],
        },
      ],
      standards: [{ id: 'std-1', isActive: true }],
      datasets: [{ skillCode: 'WRITING', itemCount: 10 }],
    });

    expect(completeness.errors).toEqual([]);
    expect(completeness.isValid).toBe(true);

    // Validation failure check
    const incompleteValidation = registry.validateAssessment('SINGLE_SKILL_TEST', {
      rubrics: [],
      templates: [],
      standards: [],
      datasets: [],
    });
    expect(incompleteValidation.isValid).toBe(false);
    expect(incompleteValidation.errors.length).toBeGreaterThan(0);
  });
});

describe('Sprint 3.8 — Prompt Intelligence & Governance', () => {
  it('PromptCatalog registers and queries prompt templates by assessment and skill', () => {
    const catalog = PromptCatalog.create({
      catalogCode: 'global-catalog',
      displayName: 'Global Prompt Catalog',
    });

    catalog.register({
      templateCode: 'ielts-writing-task2-v1',
      assessmentType: 'IELTS',
      skillCode: 'WRITING_TASK_2',
      displayName: 'IELTS Writing Task 2',
      releaseStatus: 'ACTIVE',
    });

    catalog.register({
      templateCode: 'toefl-writing-v1',
      assessmentType: 'TOEFL',
      skillCode: 'WRITING',
      displayName: 'TOEFL Writing',
      releaseStatus: 'ACTIVE',
    });

    const ieltsPrompts = catalog.listByAssessment('IELTS');
    expect(ieltsPrompts).toHaveLength(1);
    expect(ieltsPrompts[0].templateCode).toBe('ielts-writing-task2-v1');

    catalog.deprecate('toefl-writing-v1');
    expect(catalog.listByAssessment('TOEFL')).toHaveLength(0);
  });

  it('PromptTemplate manages versions and placeholder validation', () => {
    const template = PromptTemplate.create({
      templateCode: 'ielts-wt2',
      assessmentType: 'IELTS',
      skillCode: 'WRITING_TASK_2',
      displayName: 'IELTS Task 2',
      systemPrompt: 'You are an IELTS essay evaluator.',
      userPromptTemplate: 'Essay: {{studentSubmission}}',
      placeholders: ['studentSubmission'],
    });

    template.activate();
    expect(template.isActive).toBe(true);

    const missing = template.validateVariables({});
    expect(missing).toEqual(['studentSubmission']);

    const valid = template.validateVariables({ studentSubmission: 'Sample text' });
    expect(valid).toEqual([]);
  });

  it('PromptGovernance handles approval lifecycle and rollout percentages', () => {
    const governance = PromptGovernance.create({
      promptVersionId: 'ver-123',
      notes: 'Initial release',
    });

    expect(governance.isApproved).toBe(false);
    expect(governance.shouldServe()).toBe(false);

    governance.approve('admin-user');
    expect(governance.isApproved).toBe(true);

    governance.setRolloutPercentage(100);
    expect(governance.isFullyRolledOut).toBe(true);
    expect(governance.shouldServe()).toBe(true);
  });
});

describe('Sprint 3.8 — Calibration & Analytics', () => {
  it('CalibrationEngine computes overall deviation, RMSE, and asserts compliance', () => {
    const engine = new CalibrationEngine();

    const session = CalibrationSession.create({
      datasetId: 'ds-1',
      assessmentProfileId: 'prof-1',
      provider: 'GEMINI',
      model: 'gemini-2.5-pro',
    });

    session.start();

    session.addResult(
      new CalibrationItemResult({
        itemId: 'item-1',
        expectedScore: 7.0,
        observedScore: 7.5,
        error: 0.5,
        criteriaExpected: { TR: 7.0, CC: 7.0 },
        criteriaObserved: { TR: 7.5, CC: 7.0 },
        confidence: 0.9,
        latencyMs: 100,
      })
    );

    session.addResult(
      new CalibrationItemResult({
        itemId: 'item-2',
        expectedScore: 6.0,
        observedScore: 6.0,
        error: 0.0,
        criteriaExpected: { TR: 6.0, CC: 6.0 },
        criteriaObserved: { TR: 6.0, CC: 6.0 },
        confidence: 0.95,
        latencyMs: 120,
      })
    );

    const mae = engine.computeOverallDeviation(session);
    expect(mae).toBe(0.25);

    const rmse = engine.computeRMSE(session);
    expect(rmse).toBeCloseTo(0.353, 2);

    const criterionDev = engine.computeCriterionDeviation(session, 'TR');
    expect(criterionDev).toBe(0.25);

    const isCompliant = engine.assertCompliance(session, {
      maxAverageDeviation: 0.5,
      maxRMSE: 0.6,
      minConfidence: 0.8,
    });
    expect(isCompliant).toBe(true);

    const summary = engine.generateSummary(
      session,
      { maxAverageDeviation: 0.5, maxRMSE: 0.6, minConfidence: 0.8 },
      { totalTokensUsed: 500, costUsd: 0.002 }
    );

    expect(summary.compliancePassed).toBe(true);
    expect(summary.averageDeviation).toBe(0.25);
  });

  it('CostAnalyticsEngine aggregates telemetry by assessment and provider', () => {
    const engine = new CostAnalyticsEngine();
    const startDate = new Date('2026-07-01T00:00:00Z');
    const endDate = new Date('2026-07-31T23:59:59Z');

    const telemetry = [
      {
        latencyMs: 200,
        provider: 'GEMINI',
        model: 'gemini-2.5-pro',
        inputTokens: 1000,
        outputTokens: 500,
        costUsd: 0.005,
        attempts: 1,
        status: 'COMPLETED',
        assessmentType: 'IELTS',
        skillCode: 'WRITING',
        timestamp: new Date('2026-07-15T12:00:00Z'),
      },
      {
        latencyMs: 250,
        provider: 'OPENAI',
        model: 'gpt-4o',
        inputTokens: 1200,
        outputTokens: 600,
        costUsd: 0.01,
        attempts: 1,
        status: 'COMPLETED',
        assessmentType: 'TOEFL',
        skillCode: 'WRITING',
        timestamp: new Date('2026-07-16T12:00:00Z'),
      },
    ];

    const summary = engine.aggregatePeriod(telemetry, startDate, endDate);
    expect(summary.totalCalls).toBe(2);
    expect(summary.totalCostUsd).toBe(0.015);
    expect(summary.costByAssessment['IELTS']).toBe(0.005);
    expect(summary.costByAssessment['TOEFL']).toBe(0.01);
  });

  it('EvaluationQualityAnalytics aggregates failure rates and quality indicators', () => {
    const quality = new EvaluationQualityAnalytics();

    const records: EvaluationQualityRecord[] = [
      {
        id: 'rec-1',
        assessmentType: 'IELTS',
        skillCode: 'WRITING',
        timestamp: new Date(),
        jsonParseFailed: false,
        schemaValidationFailed: false,
        parserFailed: false,
        hallucinationDetected: false,
        confidenceScore: 0.95,
        latencyMs: 150,
      },
      {
        id: 'rec-2',
        assessmentType: 'IELTS',
        skillCode: 'WRITING',
        timestamp: new Date(),
        jsonParseFailed: true,
        schemaValidationFailed: false,
        parserFailed: false,
        hallucinationDetected: false,
        confidenceScore: 0.6,
        latencyMs: 180,
      },
    ];

    const summaries = quality.aggregateQuality(records, 'IELTS');
    expect(summaries).toHaveLength(1);
    expect(summaries[0].totalEvaluations).toBe(2);
    expect(summaries[0].jsonParseFailureRate).toBe(0.5);
    expect(summaries[0].overallFailureRate).toBe(0.5);
  });

  it('MultiVariantPromptExperiment tracks variants, records metrics, and resolves winner', () => {
    const exp = MultiVariantPromptExperiment.create({
      experimentCode: 'exp-v1-vs-v2',
      assessmentType: 'IELTS',
      skillCode: 'WRITING_TASK_2',
      datasetId: 'ds-wt2',
    });

    exp.addVariant(
      new ExperimentVariant({ variantId: 'v1', promptVersionId: 'pv-1', label: 'Variant 1' })
    );
    exp.addVariant(
      new ExperimentVariant({ variantId: 'v2', promptVersionId: 'pv-2', label: 'Variant 2' })
    );

    exp.start();
    expect(exp.status).toBe('RUNNING');

    exp.recordResult(
      new VariantMetrics({
        variantId: 'v1',
        averageDeviation: 0.4,
        rootMeanSquaredError: 0.5,
        scoringVariance: 0.25,
        averageLatencyMs: 200,
        totalTokens: 1000,
        totalCostUsd: 0.005,
      })
    );

    exp.recordResult(
      new VariantMetrics({
        variantId: 'v2',
        averageDeviation: 0.2, // Better accuracy
        rootMeanSquaredError: 0.3,
        scoringVariance: 0.09,
        averageLatencyMs: 180,
        totalTokens: 900,
        totalCostUsd: 0.004,
      })
    );

    exp.complete('v2');
    expect(exp.status).toBe('COMPLETED');
    expect(exp.winnerVariantId).toBe('v2');
  });
});
