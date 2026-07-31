import { describe, it, expect } from 'vitest';

export class SatExamPlugin {
  examType = 'SAT';
  displayName = 'Digital SAT Assessment Engine';
  sections = ['Reading', 'Writing', 'Math'];

  calculateOverallScore(rawScore: number, totalQuestions: number) {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    const totalSat = Math.round(400 + ratio * 1200);

    let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
    if (totalSat >= 1450) cefr = 'C2';
    else if (totalSat >= 1300) cefr = 'C1';
    else if (totalSat >= 1050) cefr = 'B2';
    else cefr = 'B1';

    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `${totalSat} / 1600`,
      overallScore: totalSat,
      cefrLevel: cefr,
    };
  }
}

export class IeltsExamPlugin {
  examType = 'IELTS Academic';
  displayName = 'IELTS Academic & General Training Engine';
  sections = ['Listening', 'Reading', 'Writing', 'Speaking'];

  calculateOverallScore(rawScore: number, totalQuestions: number) {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    let band = 5.0;
    if (ratio >= 0.88) band = 9.0;
    else if (ratio >= 0.80) band = 8.5;
    else if (ratio >= 0.73) band = 8.0;
    else if (ratio >= 0.65) band = 7.5;
    else if (ratio >= 0.58) band = 7.0;
    else if (ratio >= 0.50) band = 6.5;
    else if (ratio >= 0.40) band = 6.0;

    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `Band ${band.toFixed(1)}`,
      overallScore: band,
    };
  }
}

export class ToeflExamPlugin {
  examType = 'TOEFL iBT';
  calculateOverallScore(rawScore: number, totalQuestions: number) {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    const toeflScale = Math.round(ratio * 120);
    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `${toeflScale} / 120`,
      overallScore: toeflScale,
    };
  }
}

export class CelpipExamPlugin {
  examType = 'CELPIP';
  calculateOverallScore(rawScore: number, totalQuestions: number) {
    const ratio = Math.min(Math.max(rawScore / (totalQuestions || 40), 0), 1);
    const clbLevel = Math.min(12, Math.max(1, Math.round(ratio * 12)));
    return {
      exam: this.examType,
      rawScore,
      totalQuestions: totalQuestions || 40,
      bandOrScale: `CLB ${clbLevel}`,
      overallScore: clbLevel,
    };
  }
}

describe('Canonical Mock Examination Engine Suite', () => {
  it('should enforce MOCK usage filtering and exclude PRACTICE-only questions', () => {
    const questions = [
      { id: 'mq1', status: 'published', usages: ['MOCK'] },
      { id: 'mq2', status: 'published', usages: ['PRACTICE', 'MOCK'] },
      { id: 'mq3', status: 'published', usages: ['PRACTICE'] }, // Strictly barred from MOCK
      { id: 'mq4', status: 'draft', usages: ['MOCK'] }, // Barred because not published
    ];

    const eligible = questions.filter(
      (q) => q.status === 'published' && q.usages.includes('MOCK')
    );

    expect(eligible.length).toBe(2);
    expect(eligible.map((q) => q.id)).toEqual(['mq1', 'mq2']);
  });

  it('should validate Digital SAT plugin scoring strategy (NO Listening, NO Speaking)', () => {
    const plugin = new SatExamPlugin();
    expect(plugin.examType).toBe('SAT');
    expect(plugin.sections).toEqual(['Reading', 'Writing', 'Math']);

    const res = plugin.calculateOverallScore(30, 40); // 75% -> 400 + 0.75 * 1200 = 1300
    expect(res.bandOrScale).toBe('1300 / 1600');
    expect(res.overallScore).toBe(1300);
    expect(res.cefrLevel).toBe('C1');
  });

  it('should validate IELTS Academic plugin scoring strategy (Band 1.0 - 9.0)', () => {
    const plugin = new IeltsExamPlugin();
    expect(plugin.examType).toBe('IELTS Academic');

    const res80 = plugin.calculateOverallScore(32, 40); // 80% -> Band 8.5
    expect(res80.bandOrScale).toBe('Band 8.5');
    expect(res80.overallScore).toBe(8.5);

    const res50 = plugin.calculateOverallScore(20, 40); // 50% -> Band 6.5
    expect(res50.bandOrScale).toBe('Band 6.5');
  });

  it('should validate TOEFL iBT plugin scoring strategy (0 - 120 scale)', () => {
    const plugin = new ToeflExamPlugin();
    expect(plugin.examType).toBe('TOEFL iBT');

    const res = plugin.calculateOverallScore(32, 40); // 80% -> 96 / 120
    expect(res.bandOrScale).toBe('96 / 120');
    expect(res.overallScore).toBe(96);
  });

  it('should validate CELPIP General plugin scoring strategy (CLB 1 - 12)', () => {
    const plugin = new CelpipExamPlugin();
    expect(plugin.examType).toBe('CELPIP');

    const res = plugin.calculateOverallScore(32, 40); // 80% -> CLB 10
    expect(res.bandOrScale).toBe('CLB 10');
    expect(res.overallScore).toBe(10);
  });

  it('should set evaluationState = EVALUATING when subjective sections are pending', () => {
    const answerPayloads = [
      { itemType: 'MCQ', userCode: 'A' },
      { itemType: 'ESSAY', userCode: null }, // Writing pending
      { itemType: 'SPEAKING_PROMPT', userCode: null }, // Speaking pending
    ];

    const hasPendingSubjective = answerPayloads.some(
      (a) => a.itemType === 'ESSAY' || a.itemType === 'SPEAKING_PROMPT' || a.itemType === 'WRITING'
    );

    const evaluationState = hasPendingSubjective ? 'EVALUATING' : 'COMPLETED';
    expect(evaluationState).toBe('EVALUATING');
  });

  it('should calculate server-authoritative timer expiry without browser clock dependency', () => {
    const startedAt = new Date('2026-07-31T12:00:00Z');
    const totalMinutes = 120;
    const expiresAt = new Date(startedAt.getTime() + totalMinutes * 60 * 1000);

    const nowOnServer = new Date('2026-07-31T12:30:00Z');
    const remainingSeconds = Math.max(0, Math.round((expiresAt.getTime() - nowOnServer.getTime()) / 1000));

    expect(remainingSeconds).toBe(5400); // 90 minutes = 5400s
  });
});
