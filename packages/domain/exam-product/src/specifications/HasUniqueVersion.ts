import { Specification } from '@clasptek/kernel';
import { ExamProduct } from '../aggregates/exam-product.aggregate';

export class HasUniqueVersion extends Specification<ExamProduct> {
  constructor(private readonly versionNo: string) {
    super();
  }

  public isSatisfiedBy(candidate: ExamProduct): boolean {
    const duplicateCount = candidate.versions.filter(
      (v) => v.versionNo.value === this.versionNo
    ).length;
    return duplicateCount <= 1;
  }
}
