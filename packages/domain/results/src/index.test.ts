import { describe, it, expect } from 'vitest';
import {
  ResultId,
  ProgressScore,
  PerformanceTrend,
  AcademicStatus,
  ResultType,
  StudentResult,
  AcademicSummary,
  AcademicProgress,
} from './index';

describe('Domain Results Bounded Context', () => {
  it('ResultId validates non-empty string', () => {
    const id = new ResultId('res-123');
    expect(id.value).toBe('res-123');
    expect(() => new ResultId('')).toThrow('ResultId cannot be empty');
  });

  it('ProgressScore validates ranges and computes percentages', () => {
    const score = new ProgressScore(85, 100);
    expect(score.value).toBe(85);
    expect(score.maxScore).toBe(100);
    expect(score.percentage).toBe(85);

    expect(() => new ProgressScore(-5, 100)).toThrow('cannot be negative');
    expect(() => new ProgressScore(105, 100)).toThrow('cannot exceed max score');
  });

  it('PerformanceTrend encapsulates trend types', () => {
    const trend = new PerformanceTrend('IMPROVING');
    expect(trend.isImproving).toBe(true);
    expect(trend.isDeclining).toBe(false);
  });

  it('AcademicStatus encapsulates status types', () => {
    const status = new AcademicStatus('ON_TRACK');
    expect(status.status).toBe('ON_TRACK');
    expect(status.isAtRisk).toBe(false);
  });

  it('ResultType validates and distinguishes evaluation types', () => {
    const type1 = new ResultType('ASSESSMENT');
    expect(type1.isEvaluation).toBe(false);

    const type2 = new ResultType('WRITING_EVALUATION');
    expect(type2.isEvaluation).toBe(true);
  });

  it('AcademicProgress aggregate manages StudentResult additions and domain events', () => {
    const progress = AcademicProgress.create('student-123');
    expect(progress.studentId).toBe('student-123');

    const result = new StudentResult({
      id: 'res-1',
      studentId: 'student-123',
      resultType: new ResultType('ASSESSMENT'),
      sourceId: 'src-100',
      title: 'Diagnostic Test 1',
      score: new ProgressScore(90, 100),
    });

    progress.addResult(result);
    expect(progress.results).toHaveLength(1);

    const summary = new AcademicSummary({
      id: 'sum-1',
      studentId: 'student-123',
      overallScore: 90,
      academicStatus: new AcademicStatus('EXCELLING'),
      performanceTrend: new PerformanceTrend('IMPROVING'),
      totalAssessments: 1,
    });

    progress.updateSummary(summary);
    expect(progress.summary?.overallScore).toBe(90);

    const events = progress.domainEvents;
    expect(events.length).toBeGreaterThan(0);
    expect((events[0] as any).eventName).toBe('ResultPublished');
  });
});
