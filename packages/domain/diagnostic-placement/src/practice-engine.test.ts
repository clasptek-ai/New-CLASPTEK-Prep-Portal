import { describe, it, expect } from 'vitest';
import {
  calculateBandOrScaleScore,
  calculateIELTSAcademicReadingScore,
  lookupIELTSAcademicReadingBand,
} from './services/BandScoreCalculator';

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

  describe('Official IELTS Academic Reading Conversion Table (0–40)', () => {
    const expectedBoundaries: [number, string, number][] = [
      [40, 'Band 9.0', 9.0],
      [39, 'Band 9.0', 9.0],
      [38, 'Band 8.5', 8.5],
      [37, 'Band 8.5', 8.5],
      [36, 'Band 8.0', 8.0],
      [35, 'Band 8.0', 8.0],
      [34, 'Band 7.5', 7.5],
      [33, 'Band 7.5', 7.5],
      [32, 'Band 7.0', 7.0],
      [30, 'Band 7.0', 7.0],
      [29, 'Band 6.5', 6.5],
      [27, 'Band 6.5', 6.5],
      [26, 'Band 6.0', 6.0],
      [23, 'Band 6.0', 6.0],
      [22, 'Band 5.5', 5.5],
      [19, 'Band 5.5', 5.5],
      [18, 'Band 5.0', 5.0],
      [15, 'Band 5.0', 5.0],
      [14, 'Band 4.5', 4.5],
      [13, 'Band 4.5', 4.5],
      [12, 'Band 4.0', 4.0],
      [10, 'Band 4.0', 4.0],
      [9, 'Band 3.5', 3.5],
      [8, 'Band 3.5', 3.5],
      [7, 'Band 3.0', 3.0],
      [6, 'Band 3.0', 3.0],
      [5, 'Band 2.5', 2.5],
      [4, 'Band 2.5', 2.5],
      [3, 'Band 2.0', 2.0],
      [2, 'Band 2.0', 2.0],
      [1, 'Band 1.0', 1.0],
      [0, 'Band 0.0', 0.0],
    ];

    expectedBoundaries.forEach(([raw, expectedBand, numericBand]) => {
      it(`should map raw score ${raw}/40 to ${expectedBand}`, () => {
        const lookup = lookupIELTSAcademicReadingBand(raw);
        expect(lookup.band).toBe(expectedBand);
        expect(lookup.numericBand).toBe(numericBand);

        const fullResult = calculateIELTSAcademicReadingScore(raw, 40);
        expect(fullResult.rawScore).toBe(raw);
        expect(fullResult.totalQuestions).toBe(40);
        expect(fullResult.bandOrScale).toBe(expectedBand);
        expect(fullResult.percentage).toBe(Math.round((raw / 40) * 100));
        expect(fullResult.isEstimated).toBe(false);
      });
    });

    it('should test complete full 40-question milestones', () => {
      expect(calculateIELTSAcademicReadingScore(40, 40).bandOrScale).toBe('Band 9.0');
      expect(calculateIELTSAcademicReadingScore(39, 40).bandOrScale).toBe('Band 9.0');
      expect(calculateIELTSAcademicReadingScore(35, 40).bandOrScale).toBe('Band 8.0');
      expect(calculateIELTSAcademicReadingScore(30, 40).bandOrScale).toBe('Band 7.0');
      expect(calculateIELTSAcademicReadingScore(27, 40).bandOrScale).toBe('Band 6.5');
      expect(calculateIELTSAcademicReadingScore(23, 40).bandOrScale).toBe('Band 6.0');
      expect(calculateIELTSAcademicReadingScore(19, 40).bandOrScale).toBe('Band 5.5');
      expect(calculateIELTSAcademicReadingScore(15, 40).bandOrScale).toBe('Band 5.0');
      expect(calculateIELTSAcademicReadingScore(13, 40).bandOrScale).toBe('Band 4.5');
      expect(calculateIELTSAcademicReadingScore(10, 40).bandOrScale).toBe('Band 4.0');
      expect(calculateIELTSAcademicReadingScore(0, 40).bandOrScale).toBe('Band 0.0');
    });
  });

  describe('Partial Practice Sets (N !== 40)', () => {
    it('should accurately calculate partial 10-question practice set (7 correct, 3 incorrect)', () => {
      const res = calculateIELTSAcademicReadingScore(7, 10);
      expect(res.rawScore).toBe(7);
      expect(res.totalQuestions).toBe(10);
      expect(res.percentage).toBe(70);
      // 7/10 scaled to 40 questions = 28 -> Band 6.5 on 40-point table
      expect(res.bandOrScale).toBe('Estimated Band 6.5');
      expect(res.label).toContain('Estimated');
      expect(res.isEstimated).toBe(true);
    });

    it('should handle partial 10-question practice set with 8 correct', () => {
      const res = calculateBandOrScaleScore('IELTS Academic', 8, 10);
      expect(res.rawScore).toBe(8);
      expect(res.totalQuestions).toBe(10);
      expect(res.percentage).toBe(80);
      // 8/10 scaled to 40 questions = 32 -> Band 7.0 on 40-point table
      expect(res.bandOrScale).toBe('Estimated Band 7.0');
      expect(res.isEstimated).toBe(true);
    });
  });

  describe('Other Exam Scoring Systems', () => {
    it('should calculate TOEFL iBT scale score accurately out of 120', () => {
      const res = calculateBandOrScaleScore('TOEFL iBT', 8, 10);
      expect(res.bandOrScale).toBe('96 / 120');
      expect(res.percentage).toBe(80);
    });

    it('should calculate Digital SAT scale score accurately out of 1600', () => {
      const res = calculateBandOrScaleScore('SAT', 8, 10);
      expect(res.bandOrScale).toBe('1360 / 1600');
      expect(res.percentage).toBe(80);
    });

    it('should calculate CELPIP CLB level accurately out of 12', () => {
      const res = calculateBandOrScaleScore('CELPIP', 8, 10);
      expect(res.bandOrScale).toBe('CLB 10');
      expect(res.percentage).toBe(80);
    });
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
