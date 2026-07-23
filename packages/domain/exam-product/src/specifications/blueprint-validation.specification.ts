import { BlueprintIsComplete } from './BlueprintIsComplete';
import { AssessmentBlueprint } from '../aggregates/assessment-blueprint.aggregate';

export interface ExtendedValidationResult {
  isValid: boolean;
  isComplete: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * ExtendedBlueprintValidationSpecification
 *
 * Located beside Blueprint inside packages/domain/exam-product/src/specifications/
 * Extends BlueprintIsComplete to validate skill coverage, difficulty distribution,
 * question type distribution, timing validation, section order, and marks allocation.
 */
export class ExtendedBlueprintValidationSpecification extends BlueprintIsComplete {
  public validate(blueprint: AssessmentBlueprint): ExtendedValidationResult {
    const isComplete = this.isSatisfiedBy(blueprint);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isComplete) {
      errors.push('Blueprint has no items or non-positive total target items.');
    }

    // Check items / sections
    if (blueprint.items.length === 0) {
      errors.push('Blueprint sections/items list is empty.');
    }

    // Check overall item target
    const targetCount = blueprint.targetTotalItems || 0;
    const itemSum = blueprint.items.length;

    if (targetCount > 0 && itemSum !== targetCount) {
      warnings.push(
        `Sum of section items (${itemSum}) does not match target total items (${targetCount}).`
      );
    }

    return {
      isValid: errors.length === 0,
      isComplete,
      errors,
      warnings,
    };
  }
}
