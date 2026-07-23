import { describe, it, expect } from 'vitest';
import {
  DiagnosticCatalog,
  AssessmentForm,
  DiagnosticAttempt,
  PlacementEngine,
  LearningStage,
  EnglishFoundation,
} from './index';
import { randomUUID } from 'crypto';

describe('Diagnostic Assessment & Placement Domain Tests', () => {
  it('should instantiate aggregates and value objects correctly', () => {
    const catalog = new DiagnosticCatalog(
      randomUUID(),
      randomUUID(),
      'ENG-PROF-DIAG',
      'Placement Assessment',
      'Description'
    );
    expect(catalog.code).toBe('ENG-PROF-DIAG');
    expect(catalog.status).toBe('DRAFT');

    catalog.publish();
    expect(catalog.status).toBe('PUBLISHED');

    const skill = new EnglishFoundation('Grammar');
    expect(skill.skill).toBe('Grammar');

    const stage = new LearningStage('Intermediate');
    expect(stage.stage).toBe('Intermediate');
  });

  it('should calculate placement and confidence deterministically using the engine', () => {
    const attempt = DiagnosticAttempt.start(randomUUID(), randomUUID(), randomUUID(), 'tenant-1');

    const form = new AssessmentForm(
      randomUUID(),
      attempt.catalogId,
      'FORM-A',
      'Placement Form A',
      'Description',
      30,
      20,
      {
        blueprintObjectives: [
          { code: 'Grammar', weight: 0.4 },
          { code: 'Vocabulary', weight: 0.6 },
        ],
      }
    );

    // Initial state check
    const emptyResult = PlacementEngine.calculate(attempt, form);
    expect(emptyResult.placementStage).toBe('Foundation');
    expect(emptyResult.questionsAnswered).toBe(0);

    // Submit some answers
    attempt.submitResponse(randomUUID(), randomUUID(), randomUUID(), { text: 'A' }, true, 1000); // correct
    attempt.submitResponse(randomUUID(), randomUUID(), randomUUID(), { text: 'B' }, false, 1500); // incorrect
    attempt.submitResponse(randomUUID(), randomUUID(), randomUUID(), { text: 'C' }, true, 1200); // correct

    const result = PlacementEngine.calculate(attempt, form);
    expect(result.questionsAnswered).toBe(3);
    expect(result.blueprintCoverage).toBeGreaterThan(0);
    expect(result.difficultyCoverage).toBeGreaterThan(0);
    expect(result.reliabilityScore).toBe(15.0); // 3 * 5
    expect(result.placementStage).toBe('Intermediate'); // 2/3 = 66.6% -> Intermediate
  });
});
