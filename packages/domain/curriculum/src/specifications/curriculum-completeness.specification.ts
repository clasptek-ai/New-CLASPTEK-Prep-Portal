import { Specification } from '@clasptek/kernel';
import { LearningModule } from '../aggregates/learning-module.aggregate';

export class CurriculumCompletenessSpecification extends Specification<LearningModule[]> {
  public isSatisfiedBy(modules: LearningModule[]): boolean {
    // A complete curriculum must contain at least one module, and all modules must be in draft, review or published state
    return modules.length > 0 && modules.every(m => m.status !== 'deleted');
  }
}
