import { describe, it, expect } from 'vitest';
import {
  ReadinessScoreVO,
  PredictionVariance,
  StabilityIndex,
  ConfidenceScore,
  ReadinessStateSnapshot,
  ReadinessTimeline,
  ReadinessTimelineEngine,
  PredictionStabilityEngine,
  SkillContributionEngine,
  ReadinessExplanationEngine,
  ScenarioPlanningEngine,
  ConfidenceAssessmentEngine,
  InstitutionalBenchmarkEngine,
} from './addendum';

describe('Readiness & Prediction Enhancements Domain Units', () => {
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const studentId = '00000000-0000-0000-0000-000000000001';
  const profileId = '00000000-0000-0000-0000-000000000002';

  it('can compile and validate value objects', () => {
    const score = new ReadinessScoreVO(85);
    expect(score.value).toBe(85);
    expect(() => new ReadinessScoreVO(105)).toThrow();

    const variance = new PredictionVariance(4.25);
    expect(variance.value).toBe(4.25);

    const index = new StabilityIndex(90);
    expect(index.score).toBe(90);

    const conf = new ConfidenceScore(88);
    expect(conf.confidence).toBe(88);
  });

  it('can manage ReadinessTimeline and calculate TrendClassifier states', () => {
    const timeline = new ReadinessTimeline({
      id: 'timeline-1',
      tenantId,
      studentId,
      profileId,
    });

    const s1 = new ReadinessStateSnapshot({
      id: 'snap-1',
      tenantId,
      timelineId: timeline.id,
      studentId,
      profileId,
      readinessScore: new ReadinessScoreVO(40),
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3),
    });

    const s2 = new ReadinessStateSnapshot({
      id: 'snap-2',
      tenantId,
      timelineId: timeline.id,
      studentId,
      profileId,
      readinessScore: new ReadinessScoreVO(55),
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    });

    const s3 = new ReadinessStateSnapshot({
      id: 'snap-3',
      tenantId,
      timelineId: timeline.id,
      studentId,
      profileId,
      readinessScore: new ReadinessScoreVO(75),
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1),
    });

    timeline.addSnapshot(s1);
    timeline.addSnapshot(s2);
    timeline.addSnapshot(s3);

    expect(timeline.snapshots).toHaveLength(3);
    expect(timeline.getLatestScore()).toBe(75);

    const engine = new ReadinessTimelineEngine();
    const trend = engine.calculateTrend(timeline.snapshots as ReadinessStateSnapshot[]);
    expect(trend.trendDirection.value).toBe('ACCELERATING');
    expect(trend.slope).toBeGreaterThan(5);
  });

  it('can evaluate PredictionStability index and states', () => {
    const engine = new PredictionStabilityEngine();
    const stability = engine.evaluateStability({
      tenantId,
      studentId,
      profileId,
      recentScores: [70, 71, 72, 70, 71],
      learningVelocity: 0.25,
      mockScores: [7.0],
      practiceCount: 50,
    });

    expect(stability.volatilityState).toBe('STABLE');
    expect(stability.stabilityScore.score).toBeGreaterThan(80);

    const volatile = engine.evaluateStability({
      tenantId,
      studentId,
      profileId,
      recentScores: [50, 75, 45, 80, 50],
      learningVelocity: 1.2,
      mockScores: [],
      practiceCount: 10,
    });

    expect(volatile.volatilityState).toBe('HIGHLY_VOLATILE');
  });

  it('can calculate SkillContribution summing to exactly 100% and generate explanations', () => {
    const engine = new SkillContributionEngine();
    const contributions = engine.calculateContributions({
      reading: 80,
      writing: 60,
      listening: 70,
      speaking: 50,
      grammar: 60,
      vocabulary: 60,
      studyconsistency: 40,
    });

    expect(contributions).toHaveLength(7);
    const sum = contributions.reduce((s, c) => s + c.contribution.percentage, 0);
    expect(sum).toBe(100);

    const explainer = new ReadinessExplanationEngine();
    const report = explainer.generateExplanation(contributions);
    expect(report.explanationText).toContain('Reading');
    expect(report.priorityFocus).toHaveLength(3);
  });

  it('can simulate scenario planning projections', () => {
    const engine = new ScenarioPlanningEngine();
    const projection = engine.simulateScenario({
      currentReadiness: 70,
      scenarioCode: 'STUDY_CONSISTENCY',
      hoursSimulated: 5,
    });

    expect(projection.projectedReadiness.value).toBe(85);
    expect(projection.predictedOfficialScore).toBe(7.5);
    expect(projection.goalProbability.probability).toBe(0.925);
  });

  it('can generate prediction confidence report and recommendations', () => {
    const engine = new ConfidenceAssessmentEngine();
    const report = engine.assessConfidence({
      studentId,
      profileId,
      stabilityScore: 90,
      mockExamCount: 3,
      completedPracticeQuestions: 150,
      lastEvaluationScore: 80,
    });

    expect(report.level).toBe('HIGHLY_RELIABLE');
    expect(report.confidence.confidence).toBeGreaterThan(90);
    expect(report.recommendations[0]).toContain('consistency');
  });

  it('can compute InstitutionalBenchmark with privacy locks', () => {
    const engine = new InstitutionalBenchmarkEngine();
    const benchmark = engine.computeBenchmarks({
      tenantId,
      examProfileCode: 'IELTS_ACADEMIC',
      cohortAverages: { C1: 82.5, C2: 78.0 },
      cohortCounts: { C1: 10, C2: 3 }, // C2 should be skipped (<5 threshold)
      instructorAverages: { I1: 81.0 },
      instructorCounts: { I1: 12 },
      pathwayAverages: { P1: 80.5 },
    });

    expect(benchmark).not.toBeNull();
    expect(benchmark!.totalStudentCount).toBe(10); // C2 skipped
    expect(benchmark!.cohorts).toHaveLength(1);
    expect(benchmark!.avgReadinessScore).toBe(82.5);
  });
});
