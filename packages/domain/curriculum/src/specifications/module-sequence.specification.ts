import { Specification } from '@clasptek/kernel';
import { ModuleSequence } from '../aggregates/learning-module.aggregate';

export class ModuleSequenceSpecification extends Specification<ModuleSequence[]> {
  public isSatisfiedBy(sequences: ModuleSequence[]): boolean {
    // Check if source matches target (invalid self sequence)
    for (const seq of sequences) {
      if (seq.sourceModuleId === seq.targetModuleId) {
        return false;
      }
    }
    return true;
  }
}
