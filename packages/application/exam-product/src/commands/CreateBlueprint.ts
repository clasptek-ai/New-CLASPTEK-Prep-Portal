import { AssessmentBlueprintRepository } from '@clasptek/domain-exam-product';
import { BlueprintFactory } from '@clasptek/domain-exam-product';
import { IUnitOfWork } from '../ports/IUnitOfWork';
import { Result } from '@clasptek/kernel';

export interface CreateBlueprintCommand {
  examProductId: string;
  examProductVersionId: string;
  officialExamComponentId: string;
  code: string;
  name: string;
  targetTotalItems?: number;
}

export class CreateBlueprintHandler {
  constructor(
    private readonly repository: AssessmentBlueprintRepository,
    private readonly uow: IUnitOfWork
  ) {}

  public async execute(command: CreateBlueprintCommand): Promise<Result<string, Error>> {
    try {
      await this.uow.begin();

      const exists = await this.repository.exists(command.code);
      if (exists) {
        throw new Error(`Blueprint with code ${command.code} already exists.`);
      }

      const blueprint = BlueprintFactory.create(
        command.examProductId,
        command.examProductVersionId,
        command.officialExamComponentId,
        command.code,
        command.name,
        command.targetTotalItems
      );

      await this.repository.save(blueprint);

      this.uow.registerOutbox({
        eventType: 'BlueprintCreatedIntegrationEvent',
        aggregateType: 'AssessmentBlueprint',
        aggregateId: blueprint.id,
        payload: {
          blueprintId: blueprint.id,
          code: blueprint.code,
          name: blueprint.name,
        },
      });

      await this.uow.commit();
      return Result.success(blueprint.id);
    } catch (err: any) {
      await this.uow.rollback();
      return Result.failure(err);
    }
  }
}
