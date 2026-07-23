import { describe, it, expect } from 'vitest';
import { ExtendedBlueprintValidationSpecification, AssessmentBlueprint } from './index';

describe('Sprint 3.3.1 Specification — ExtendedBlueprintValidationSpecification', () => {
  it('validates blueprint completeness and section targets', () => {
    const spec = new ExtendedBlueprintValidationSpecification();
    const blueprint = new AssessmentBlueprint(
      'bp-1',
      'ep-1',
      'epv-1',
      'oec-1',
      'BP-IELTS-DIAG',
      'IELTS Diagnostic Blueprint',
      'Description',
      '1.0.0',
      40, // minTotalItems
      100, // maxTotalItems
      80 // targetTotalItems
    );

    blueprint.addItem('item-1', 'mcq', 'SEC-R', 'Reading Section');

    const res = spec.validate(blueprint);
    expect(res.isComplete).toBe(true);
    expect(res.isValid).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0); // Sum of section quantities (1) !== target (80)
  });
});
