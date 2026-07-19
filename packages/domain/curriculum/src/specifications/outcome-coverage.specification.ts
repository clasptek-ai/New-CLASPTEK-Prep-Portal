import { Specification } from '@clasptek/kernel';
import { LearningOutcome } from '../entities/learning-outcome.entity';

export class OutcomeCoverageSpecification extends Specification<LearningOutcome[]> {
  public isSatisfiedBy(outcomes: LearningOutcome[]): boolean {
    // Basic verification: must have at least one measurable learning outcome defined
    if (outcomes.length === 0) {
      return false;
    }
    return outcomes.every(o => o.isMeasurable && o.status === 'published' || o.status === 'draft');
  }
}
