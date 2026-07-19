import { Specification } from '@clasptek/kernel';
import { ExamProduct } from '../aggregates/exam-product.aggregate';

export class CanPublishExamProduct extends Specification<ExamProduct> {
  public isSatisfiedBy(candidate: ExamProduct): boolean {
    if (!candidate.name || candidate.name.trim() === '') {
      return false;
    }
    if (candidate.versions.length === 0) {
      return false;
    }
    // Candidate has at least one version that is APPROVED or DRAFT
    const hasPublishableVersion = candidate.versions.some(
      (v) => v.status === 'APPROVED' || v.status === 'DRAFT'
    );
    if (!hasPublishableVersion) {
      return false;
    }
    return true;
  }
}
