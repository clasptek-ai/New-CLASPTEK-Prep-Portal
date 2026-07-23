import { describe, test, expect } from 'vitest';
import {
  MockScore,
  OfficialScore,
  Percentile,
  ReadinessScore,
  TimeRemaining,
  MockBlueprint,
  MockSession,
  ScoringEngine,
  TemplateBuilderService,
  MockTemplateSection,
  ReadinessEngine,
  ReportingEngine,
  TrendAnalyzer,
  VelocityAnalyzer,
  ConsistencyAnalyzer,
} from './index';

describe('Mock Examination Engine Domain Unit Tests', () => {
  test('creates Value Objects', () => {
    const score = new MockScore(85);
    expect(score.rawValue).toBe(85);

    const official = new OfficialScore('IELTS Band 7.5', 7.5);
    expect(official.label).toBe('IELTS Band 7.5');

    const pct = new Percentile(92);
    expect(pct.value).toBe(92);

    const readiness = new ReadinessScore(88);
    expect(readiness.percentage).toBe(88);

    const timer = new TimeRemaining(300);
    expect(timer.isExpired).toBe(false);
  });

  test('MockBlueprint lifecycle transitions', () => {
    const bp = MockBlueprint.create('bp-1', 'IELTS-ACAD', 'IELTS Mock Exam', 'IELTS');
    expect(bp.status).toBe('DRAFT');

    bp.submitForReview();
    expect(bp.status).toBe('UNDER_REVIEW');

    bp.approve();
    expect(bp.status).toBe('APPROVED');

    bp.publish();
    expect(bp.status).toBe('PUBLISHED');
  });

  test('TemplateBuilderService builds template from approved blueprint', () => {
    const bp = MockBlueprint.create('bp-1', 'IELTS-ACAD', 'IELTS Mock Exam', 'IELTS');
    bp.submitForReview();
    bp.approve();

    const sections = [
      new MockTemplateSection({
        id: 'sec-1',
        templateId: 'temp-1',
        sectionName: 'Listening',
        orderIndex: 0,
        durationMinutes: 30,
        questionCount: 40,
        weight: 1.0,
      }),
      new MockTemplateSection({
        id: 'sec-2',
        templateId: 'temp-1',
        sectionName: 'Reading',
        orderIndex: 1,
        durationMinutes: 60,
        questionCount: 40,
        weight: 1.0,
      }),
    ];

    const builder = new TemplateBuilderService();
    const template = builder.buildTemplateFromBlueprint(bp, sections);
    expect(template.totalDurationMinutes).toBe(90);
    expect(template.sections).toHaveLength(2);
  });

  test('MockSession state machine transitions', () => {
    const session = new MockSession({
      id: 'sess-1',
      studentId: 'stud-1',
      templateId: 'temp-1',
    });
    expect(session.status).toBe('SCHEDULED');

    session.start();
    expect(session.status).toBe('IN_PROGRESS');

    session.completeSection();
    expect(session.currentSectionIndex).toBe(1);

    session.submit();
    expect(session.status).toBe('SUBMITTED');
  });

  test('ScoringEngine calculates scaled scores for IELTS, TOEFL, SAT', () => {
    const engine = new ScoringEngine();
    const answers = [
      { questionId: 'q1', sectionId: 's1', answer: 'A', timeSpentMs: 10000, isCorrect: true },
      { questionId: 'q2', sectionId: 's1', answer: 'B', timeSpentMs: 12000, isCorrect: true },
      { questionId: 'q3', sectionId: 's1', answer: 'C', timeSpentMs: 15000, isCorrect: false },
    ];

    const ieltsRes = engine.scoreAttempt('sess-1', 'stud-1', 'IELTS', answers);
    expect(ieltsRes.officialScoreLabel).toContain('IELTS Band');

    const satRes = engine.scoreAttempt('sess-1', 'stud-1', 'SAT', answers);
    expect(satRes.officialScoreLabel).toContain('SAT');
  });

  test('ReadinessEngine and ReportingEngine produce analysis', () => {
    const scoringEngine = new ScoringEngine();
    const answers = [
      { questionId: 'q1', sectionId: 's1', answer: 'A', timeSpentMs: 10000, isCorrect: true },
    ];
    const res = scoringEngine.scoreAttempt('sess-1', 'stud-1', 'SAT', answers);

    const readinessEngine = new ReadinessEngine();
    const readiness = readinessEngine.calculateReadiness('stud-1', res);
    expect(readiness.overallReadinessPct).toBeGreaterThan(0);

    const reportingEngine = new ReportingEngine();
    const report = reportingEngine.generateReport(res);
    expect(report.strongAreas).toHaveLength(2);
  });

  test('Historical Analytics Sub-Analyzers calculate metrics', () => {
    const trend = new TrendAnalyzer();
    expect(trend.computeTrend([60, 70, 85])).toBe('IMPROVING');

    const velocity = new VelocityAnalyzer();
    expect(velocity.computeVelocity([60, 70, 80])).toBe(7);

    const consistency = new ConsistencyAnalyzer();
    expect(consistency.computeConsistency([70, 72, 71])).toBeGreaterThan(80);
  });
});
