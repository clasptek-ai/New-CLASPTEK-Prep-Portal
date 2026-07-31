import { describe, it, expect } from 'vitest';
import { calculateBandOrScaleScore } from './services/BandScoreCalculator';

describe('Canonical Practice Engine Suite', () => {
  it('should filter PRACTICE usage questions and exclude MOCK-only questions', () => {
    const questions = [
      { id: 'q1', status: 'published', usages: ['PRACTICE'] },
      { id: 'q2', status: 'published', usages: ['DIAGNOSTIC', 'PRACTICE'] },
      { id: 'q3', status: 'published', usages: ['MOCK'] }, // Barred from practice
      { id: 'q4', status: 'draft', usages: ['PRACTICE'] }, // Barred from practice
    ];

    const eligible = questions.filter(
      (q) => q.status === 'published' && q.usages.includes('PRACTICE') && !q.usages.includes('MOCK')
    );

    expect(eligible.length).toBe(2);
    expect(eligible[0].id).toBe('q1');
    expect(eligible[1].id).toBe('q2');
  });

  it('should calculate IELTS Academic band score accurately', () => {
    const res80 = calculateBandOrScaleScore('IELTS Academic', 8, 10);
    expect(res80.bandOrScale).toBe('Band 7.5');
    expect(res80.percentage).toBe(80);

    const res50 = calculateBandOrScaleScore('IELTS Academic', 5, 10);
    expect(res50.bandOrScale).toBe('Band 5.5');
  });

  it('should calculate TOEFL iBT scale score accurately out of 120', () => {
    const res = calculateBandOrScaleScore('TOEFL iBT', 8, 10);
    expect(res.bandOrScale).toBe('96 / 120');
  });

  it('should calculate Digital SAT scale score accurately out of 1600', () => {
    const res = calculateBandOrScaleScore('SAT', 8, 10);
    expect(res.bandOrScale).toBe('1360 / 1600');
  });

  it('should calculate CELPIP CLB level accurately out of 12', () => {
    const res = calculateBandOrScaleScore('CELPIP', 8, 10);
    expect(res.bandOrScale).toBe('CLB 10');
  });

  it('should prioritize lowest scoring Diagnostic skills for Practice recommendations', () => {
    const diagnosticScores = [
      { skill: 'Reading', score: 68 },
      { skill: 'Grammar', score: 42 },
      { skill: 'Listening', score: 75 },
    ];

    const sorted = [...diagnosticScores].sort((a, b) => a.score - b.score);
    expect(sorted[0].skill).toBe('Grammar');
    expect(sorted[0].score).toBe(42);
  });
});
