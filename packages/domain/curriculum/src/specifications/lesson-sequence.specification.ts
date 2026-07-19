import { Specification } from '@clasptek/kernel';
import { LessonSequence } from '../aggregates/lesson.aggregate';

export class LessonSequenceSpecification extends Specification<LessonSequence[]> {
  public isSatisfiedBy(sequences: LessonSequence[]): boolean {
    for (const seq of sequences) {
      if (seq.sourceLessonId === seq.targetLessonId) {
        return false;
      }
    }
    return true;
  }
}
