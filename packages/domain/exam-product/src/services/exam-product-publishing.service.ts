import { ExamProduct } from '../aggregates/exam-product.aggregate';
import { CanPublishExamProduct } from '../specifications/CanPublishExamProduct';
import { DomainError } from '../errors/exam-product-errors';
import { Result } from '@clasptek/kernel';

export class ExamProductPublishingService {
  public publish(
    product: ExamProduct,
    versionId: string,
    actorId: string
  ): Result<void, DomainError> {
    try {
      const spec = new CanPublishExamProduct();
      if (!spec.isSatisfiedBy(product)) {
        return Result.failure(
          new DomainError(
            'Exam product does not satisfy publish specifications: must have name and at least one version.'
          )
        );
      }

      product.publishVersion(versionId, actorId);
      return Result.success(undefined);
    } catch (err: any) {
      return Result.failure(new DomainError(err.message || 'Publishing failed.'));
    }
  }
}
