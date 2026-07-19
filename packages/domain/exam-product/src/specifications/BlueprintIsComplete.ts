import { Specification } from '@clasptek/kernel';
import { AssessmentBlueprint } from '../aggregates/assessment-blueprint.aggregate';

export class BlueprintIsComplete extends Specification<AssessmentBlueprint> {
  public isSatisfiedBy(candidate: AssessmentBlueprint): boolean {
    if (candidate.items.length === 0) {
      return false;
    }
    // Blueprint is complete if total items > 0 and weight is non-negative
    const totalItems = candidate.targetTotalItems ?? 0;
    if (totalItems <= 0 && (candidate.minimumTotalItems ?? 0) <= 0) {
      return false;
    }
    return true;
  }
}
