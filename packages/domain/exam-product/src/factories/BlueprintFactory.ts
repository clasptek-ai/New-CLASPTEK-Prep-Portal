import { randomUUID } from 'crypto';
import { AssessmentBlueprint } from '../aggregates/assessment-blueprint.aggregate';

export class BlueprintFactory {
  public static create(
    examProductId: string,
    examProductVersionId: string,
    officialExamComponentId: string,
    code: string,
    name: string,
    targetTotalItems?: number
  ): AssessmentBlueprint {
    const id = randomUUID();
    return new AssessmentBlueprint(
      id,
      examProductId,
      examProductVersionId,
      officialExamComponentId,
      code,
      name,
      undefined,
      '1.0.0',
      undefined,
      undefined,
      targetTotalItems,
      100.00
    );
  }
}
