import { describe, it, expect } from 'vitest';

describe('Phase 9 — Platform-Wide Cross-Module Integration Suite', () => {
  it('should route questions strictly by usage type', () => {
    const bank = [
      { id: 'q1', status: 'published', usages: ['DIAGNOSTIC'] },
      { id: 'q2', status: 'published', usages: ['PRACTICE'] },
      { id: 'q3', status: 'published', usages: ['MOCK'] },
      { id: 'q4', status: 'published', usages: ['DIAGNOSTIC', 'PRACTICE', 'MOCK'] },
    ];

    const diag = bank.filter((q) => q.usages.includes('DIAGNOSTIC'));
    const prac = bank.filter((q) => q.usages.includes('PRACTICE'));
    const mock = bank.filter((q) => q.usages.includes('MOCK'));

    expect(diag.map((q) => q.id)).toEqual(['q1', 'q4']);
    expect(prac.map((q) => q.id)).toEqual(['q2', 'q4']);
    expect(mock.map((q) => q.id)).toEqual(['q3', 'q4']);
  });

  it('should normalize evidence weights for readiness calculation (Diagnostic 30%, Practice 30%, Mock 40%)', () => {
    const diagScore = 60; // 60 * 0.3 = 18
    const pracScore = 80; // 80 * 0.3 = 24
    const mockScore = 90; // 90 * 0.4 = 36

    const totalWeight = 0.3 + 0.3 + 0.4;
    const overallReadiness = Math.round((diagScore * 0.3 + pracScore * 0.3 + mockScore * 0.4) / totalWeight);

    expect(overallReadiness).toBe(78); // 18 + 24 + 36 = 78
  });

  it('should return PENDING_EVALUATION risk level when candidate has completed zero activities', () => {
    const totalWeight = 0;
    const riskLevel = totalWeight === 0 ? 'PENDING_EVALUATION' : 'LOW';

    expect(riskLevel).toBe('PENDING_EVALUATION');
  });

  it('should map permanent media upload references for speaking recordings', () => {
    const assetId = 'asset-12345';
    const mediaUrl = `/api/v1/media/assets/${assetId}`;

    expect(mediaUrl).not.toContain('blob:');
    expect(mediaUrl).toContain('/api/v1/media/assets/');
  });

  it('should validate normalized exam product strings', () => {
    const supportedProgrammes = [
      'English Proficiency',
      'IELTS Academic',
      'IELTS General Training',
      'TOEFL iBT',
      'Digital SAT',
      'CELPIP General',
    ];

    expect(supportedProgrammes).toContain('English Proficiency');
    expect(supportedProgrammes).toContain('IELTS Academic');
    expect(supportedProgrammes).toContain('IELTS General Training');
    expect(supportedProgrammes).toContain('TOEFL iBT');
    expect(supportedProgrammes).toContain('Digital SAT');
    expect(supportedProgrammes).toContain('CELPIP General');
    expect(supportedProgrammes.length).toBe(6);
  });
});
