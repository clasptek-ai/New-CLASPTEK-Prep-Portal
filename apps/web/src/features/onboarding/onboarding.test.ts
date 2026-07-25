import { describe, test, expect } from 'vitest';
import { OnboardingState } from './types/onboarding-state';
import { getDiagnosticDefinition, diagnosticRegistry } from './config/diagnostic-registry';
import { BrandConfig } from '@/config/brand.config';

describe('Student Onboarding & Diagnostic Gateway Integration Tests', () => {
  test('OnboardingState enum defines correct state machine lifecycle', () => {
    expect(OnboardingState.NOT_STARTED).toBe('NOT_STARTED');
    expect(OnboardingState.DIAGNOSTIC_REQUIRED).toBe('DIAGNOSTIC_REQUIRED');
    expect(OnboardingState.DIAGNOSTIC_IN_PROGRESS).toBe('DIAGNOSTIC_IN_PROGRESS');
    expect(OnboardingState.DIAGNOSTIC_COMPLETED).toBe('DIAGNOSTIC_COMPLETED');
    expect(OnboardingState.ONBOARDING_COMPLETED).toBe('ONBOARDING_COMPLETED');
  });

  test('getDiagnosticDefinition resolves dynamic parameters per target exam', () => {
    const ielts = getDiagnosticDefinition('IELTS Academic');
    expect(ielts.examType).toBe('IELTS Academic');
    expect(ielts.durationMinutes).toBe(25);
    expect(ielts.questionCount).toBe(30);
    expect(ielts.skillsEvaluated).toContain('Academic Reading');

    const sat = getDiagnosticDefinition('SAT');
    expect(sat.examType).toBe('SAT');
    expect(sat.durationMinutes).toBe(45);
    expect(sat.questionCount).toBe(40);
    expect(sat.skillsEvaluated).toContain('Algebra & Advanced Math');

    const fallback = getDiagnosticDefinition('UNKNOWN_EXAM');
    expect(fallback.examType).toBe('IELTS Academic');
  });

  test('BrandConfig defines canonical platform branding', () => {
    expect(BrandConfig.portalName).toBe('Clasptek Global');
    expect(BrandConfig.organizationName).toBe('Clasptek Global');
    expect(BrandConfig.shortName).toBe('Clasptek Global');
    expect(BrandConfig.logoUrl).toBe('/logo.png');
  });
});
