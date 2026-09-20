import { describe, it, expect } from 'vitest';
import {
  analyzeAssessmentIntelligence,
  VerifiedAssessmentResult,
  parseNumericBand,
} from './assessment-intelligence';

describe('Assessment Intelligence Engine (Phase 3)', () => {
  describe('parseNumericBand helper', () => {
    it('correctly extracts numeric band from string formats', () => {
      expect(parseNumericBand('Band 6.5')).toBe(6.5);
      expect(parseNumericBand('7.0')).toBe(7.0);
      expect(parseNumericBand('Band 8')).toBe(8);
      expect(parseNumericBand(undefined)).toBeNull();
      expect(parseNumericBand('Invalid')).toBeNull();
    });
  });

  // Test 1 — New Candidate (No Diagnostic)
  it('handles new candidate with zero assessment records cleanly', () => {
    const profile = analyzeAssessmentIntelligence([], 'IELTS Academic');
    expect(profile.hasDiagnostic).toBe(false);
    expect(profile.baselineResult).toBeNull();
    expect(profile.latestResult).toBeNull();
    expect(profile.strongestSkill).toBeNull();
    expect(profile.priorityDevelopmentArea).toBeNull();
    expect(profile.comparison).toBeNull();
    expect(profile.recommendedAction.label).toBe('Take Pre-Assessment');
    expect(profile.recommendedAction.destination).toBe('/student/assessments');
    expect(profile.recommendedAction.state).toBe('NO_DIAGNOSTIC');
  });

  // Test 2 — Diagnostic Completed with comparable section data
  it('determines strongest skill and priority development area when >= 2 comparable sections exist', () => {
    const diagnostic: VerifiedAssessmentResult = {
      resultId: 'res-diag-1',
      attemptId: 'att-diag-1',
      examType: 'IELTS Academic',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 68,
      predictedBand: 'Band 6.5',
      cefrLevel: 'B2',
      generatedAt: '2026-08-01T10:00:00Z',
      sectionScores: [
        { sectionCode: 'READ', sectionName: 'Reading Comprehension', scorePercentage: 52 },
        { sectionCode: 'LIST', sectionName: 'Listening Comprehension', scorePercentage: 80 },
        { sectionCode: 'WRIT', sectionName: 'Writing & Essay', scorePercentage: 64 },
        { sectionCode: 'SPK', sectionName: 'Speaking Module', scorePercentage: 72 },
      ],
    };

    const profile = analyzeAssessmentIntelligence([diagnostic], 'IELTS Academic');
    expect(profile.hasDiagnostic).toBe(true);
    expect(profile.baselineResult?.resultId).toBe('res-diag-1');
    expect(profile.strongestSkill?.skillName).toBe('Listening');
    expect(profile.strongestSkill?.scorePercentage).toBe(80);
    expect(profile.priorityDevelopmentArea?.skillName).toBe('Reading');
    expect(profile.priorityDevelopmentArea?.scorePercentage).toBe(52);
    expect(profile.recommendedAction.label).toBe('Practice Reading →');
    expect(profile.recommendedAction.destination).toBe('/practice?skill=Reading');
    expect(profile.recommendedAction.state).toBe('DIAGNOSTIC_PRIORITY');
  });

  // Test 3 — Diagnostic Completed with balanced section scores
  it('does not invent a weakness when all measured skills show balanced scores', () => {
    const diagnostic: VerifiedAssessmentResult = {
      resultId: 'res-diag-2',
      attemptId: 'att-diag-2',
      examType: 'IELTS Academic',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 75,
      predictedBand: 'Band 7.0',
      generatedAt: '2026-08-01T10:00:00Z',
      sectionScores: [
        { sectionCode: 'READ', sectionName: 'Reading', scorePercentage: 75 },
        { sectionCode: 'LIST', sectionName: 'Listening', scorePercentage: 75 },
      ],
    };

    const profile = analyzeAssessmentIntelligence([diagnostic], 'IELTS Academic');
    expect(profile.strongestSkill).toBeNull();
    expect(profile.priorityDevelopmentArea).toBeNull();
    expect(profile.priorityEvidence).toContain('balanced');
    expect(profile.recommendedAction.label).toBe('Continue Practice');
    expect(profile.recommendedAction.destination).toBe('/practice');
    expect(profile.recommendedAction.state).toBe('DIAGNOSTIC_BALANCED');
  });

  // Test 4 — Diagnostic Completed with only 1 valid section
  it('refuses to fabricate comparative strengths/weaknesses when only 1 section exists', () => {
    const diagnostic: VerifiedAssessmentResult = {
      resultId: 'res-diag-3',
      attemptId: 'att-diag-3',
      examType: 'IELTS Academic',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 60,
      generatedAt: '2026-08-01T10:00:00Z',
      sectionScores: [{ sectionCode: 'READ', sectionName: 'Reading', scorePercentage: 60 }],
    };

    const profile = analyzeAssessmentIntelligence([diagnostic], 'IELTS Academic');
    expect(profile.strongestSkill).toBeNull();
    expect(profile.priorityDevelopmentArea).toBeNull();
    expect(profile.priorityEvidence).toContain('Complete more skill modules');
    expect(profile.recommendedAction.label).toBe('Continue Practice');
  });

  // Test 5 — Mock Completed on same examination as baseline
  it('computes accurate baseline-vs-mock comparison when both diagnostic and mock exist', () => {
    const diagnostic: VerifiedAssessmentResult = {
      resultId: 'res-diag-1',
      attemptId: 'att-diag-1',
      examType: 'IELTS Academic',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 60,
      predictedBand: 'Band 6.0',
      generatedAt: '2026-08-01T10:00:00Z',
      sectionScores: [
        { sectionCode: 'READ', sectionName: 'Reading', scorePercentage: 55 },
        { sectionCode: 'LIST', sectionName: 'Listening', scorePercentage: 65 },
      ],
    };

    const mock: VerifiedAssessmentResult = {
      resultId: 'res-mock-1',
      attemptId: 'att-mock-1',
      examType: 'IELTS Academic',
      assessmentCategory: 'MOCK',
      overallScore: 72,
      predictedBand: 'Band 6.5',
      generatedAt: '2026-08-15T14:00:00Z',
      sectionScores: [
        { sectionCode: 'READ', sectionName: 'Reading', scorePercentage: 70 },
        { sectionCode: 'LIST', sectionName: 'Listening', scorePercentage: 74 },
      ],
    };

    const profile = analyzeAssessmentIntelligence([mock, diagnostic], 'IELTS Academic');
    expect(profile.hasCompletedMock).toBe(true);
    expect(profile.comparison).not.toBeNull();
    expect(profile.comparison?.scoreDelta).toBe(12); // 72 - 60
    expect(profile.comparison?.bandDelta).toBe(0.5); // 6.5 - 6.0
    expect(profile.comparison?.summaryStatement).toContain(
      '0.5 bands higher than your diagnostic baseline'
    );
    expect(profile.recommendedAction.label).toBe('Review Results');
    expect(profile.recommendedAction.state).toBe('MOCK_REVIEW');
  });

  // Test 6 — Mock Completed on DIFFERENT examination from baseline
  it('strictly isolates examinations and never compares cross-examination results', () => {
    const diagnosticIELTS: VerifiedAssessmentResult = {
      resultId: 'res-diag-ielts',
      attemptId: 'att-diag-ielts',
      examType: 'IELTS Academic',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 65,
      predictedBand: 'Band 6.5',
      generatedAt: '2026-08-01T10:00:00Z',
    };

    const mockTOEFL: VerifiedAssessmentResult = {
      resultId: 'res-mock-toefl',
      attemptId: 'att-mock-toefl',
      examType: 'TOEFL iBT',
      assessmentCategory: 'MOCK',
      overallScore: 90,
      predictedBand: '100 / 120',
      generatedAt: '2026-08-10T10:00:00Z',
    };

    // Analyzing under IELTS Academic context
    const profileIELTS = analyzeAssessmentIntelligence(
      [diagnosticIELTS, mockTOEFL],
      'IELTS Academic'
    );
    expect(profileIELTS.hasDiagnostic).toBe(true);
    expect(profileIELTS.hasCompletedMock).toBe(false);
    expect(profileIELTS.comparison).toBeNull(); // ZERO cross-exam comparison

    // Analyzing under TOEFL iBT context
    const profileTOEFL = analyzeAssessmentIntelligence([diagnosticIELTS, mockTOEFL], 'TOEFL iBT');
    expect(profileTOEFL.hasDiagnostic).toBe(false); // No TOEFL diagnostic
    expect(profileTOEFL.hasCompletedMock).toBe(true);
    expect(profileTOEFL.comparison).toBeNull(); // Cannot compare without TOEFL diagnostic
  });

  // Test 7 — Incomplete Mock / In-Progress Attempt
  it('strictly excludes incomplete or in-progress attempts from baseline, latest result, and progression', () => {
    const diagnostic: VerifiedAssessmentResult = {
      resultId: 'r-diag',
      attemptId: 'a-diag',
      examType: 'IELTS Academic',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 65,
      predictedBand: 'Band 6.5',
      generatedAt: '2026-08-01T10:00:00Z',
    };

    const incompleteMock: any = {
      resultId: 'r-mock-incomplete',
      attemptId: 'a-mock-incomplete',
      examType: 'IELTS Academic',
      assessmentCategory: 'MOCK',
      overallScore: 0,
      placementLifecycle: 'IN_PROGRESS',
      generatedAt: '2026-08-15T10:00:00Z',
    };

    const profile = analyzeAssessmentIntelligence([incompleteMock, diagnostic], 'IELTS Academic');
    expect(profile.hasDiagnostic).toBe(true);
    expect(profile.hasCompletedMock).toBe(false);
    expect(profile.comparison).toBeNull(); // Incomplete mock CANNOT produce delta
    expect(profile.latestResult?.resultId).toBe('r-diag'); // Did NOT become latest result
    expect(profile.chronologicalProgression.length).toBe(1); // Excluded from ledger
  });

  // Test 9 — Multiple Completed Mocks Progression
  it('maintains strict chronological ordering across baseline and multiple mocks', () => {
    const diag: VerifiedAssessmentResult = {
      resultId: 'r1',
      attemptId: 'a1',
      examType: 'IELTS Academic',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 60,
      generatedAt: '2026-08-01T10:00:00Z',
    };
    const mock1: VerifiedAssessmentResult = {
      resultId: 'r2',
      attemptId: 'a2',
      examType: 'IELTS Academic',
      assessmentCategory: 'MOCK',
      overallScore: 65,
      generatedAt: '2026-08-10T10:00:00Z',
    };
    const mock2: VerifiedAssessmentResult = {
      resultId: 'r3',
      attemptId: 'a3',
      examType: 'IELTS Academic',
      assessmentCategory: 'MOCK',
      overallScore: 70,
      generatedAt: '2026-08-20T10:00:00Z',
    };

    // Input unsorted
    const profile = analyzeAssessmentIntelligence([mock2, diag, mock1], 'IELTS Academic');
    expect(profile.chronologicalProgression.length).toBe(3);
    expect(profile.chronologicalProgression[0].resultId).toBe('r1');
    expect(profile.chronologicalProgression[1].resultId).toBe('r2');
    expect(profile.chronologicalProgression[2].resultId).toBe('r3');
    // Latest result should be the latest completed mock
    expect(profile.latestResult?.resultId).toBe('r3');
  });

  // Test 10 — Multi-Examination Support (Digital SAT)
  it('supports non-IELTS examinations such as Digital SAT with native dimensions', () => {
    const satDiag: VerifiedAssessmentResult = {
      resultId: 'sat-diag-1',
      attemptId: 'sat-att-1',
      examType: 'Digital SAT',
      assessmentCategory: 'DIAGNOSTIC',
      overallScore: 72,
      predictedBand: '1280 / 1600',
      generatedAt: '2026-08-01T10:00:00Z',
      sectionScores: [
        { sectionCode: 'RW', sectionName: 'Reading & Writing', scorePercentage: 68 },
        { sectionCode: 'MATH', sectionName: 'Math', scorePercentage: 82 },
      ],
    };

    const satMock: VerifiedAssessmentResult = {
      resultId: 'sat-mock-1',
      attemptId: 'sat-att-2',
      examType: 'Digital SAT',
      assessmentCategory: 'MOCK',
      overallScore: 78,
      predictedBand: '1360 / 1600',
      generatedAt: '2026-08-18T10:00:00Z',
      sectionScores: [
        { sectionCode: 'RW', sectionName: 'Reading & Writing', scorePercentage: 75 },
        { sectionCode: 'MATH', sectionName: 'Math', scorePercentage: 86 },
      ],
    };

    const profile = analyzeAssessmentIntelligence([satMock, satDiag], 'Digital SAT');
    expect(profile.examType).toBe('Digital SAT');
    expect(profile.hasDiagnostic).toBe(true);
    expect(profile.hasCompletedMock).toBe(true);
    expect(profile.strongestSkill?.skillName).toBe('Math');
    expect(profile.priorityDevelopmentArea?.skillName).toBe('Reading');
    expect(profile.comparison?.scoreDelta).toBe(6); // 78 - 72
    expect(profile.comparison?.summaryStatement).toBe(
      'Latest mock: +80 points compared to your diagnostic baseline.'
    );
    expect(profile.recommendedAction.label).toBe('Review Results');
  });
});
