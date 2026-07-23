import { AssessmentBlueprint } from '../aggregates/assessment-blueprint.aggregate';
import { BlueprintIsComplete } from '../specifications/BlueprintIsComplete';
import { DomainError } from '../errors/exam-product-errors';
import { Result } from '@clasptek/kernel';

export class BlueprintPublishingService {
  public publish(blueprint: AssessmentBlueprint, actorId: string): Result<void, DomainError> {
    try {
      const spec = new BlueprintIsComplete();
      if (!spec.isSatisfiedBy(blueprint)) {
        return Result.failure(
          new DomainError(
            'Blueprint is incomplete: must contain items and define a positive item target.'
          )
        );
      }

      blueprint.publish(actorId);
      return Result.success(undefined);
    } catch (err: any) {
      return Result.failure(new DomainError(err.message || 'Blueprint publishing failed.'));
    }
  }
}
