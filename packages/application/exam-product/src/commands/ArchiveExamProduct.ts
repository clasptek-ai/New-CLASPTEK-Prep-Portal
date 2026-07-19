import { ExamProductRepository } from '@clasptek/domain-exam-product';
import { IUnitOfWork } from '../ports/IUnitOfWork';
import { Result } from '@clasptek/kernel';

export interface ArchiveExamProductCommand {
  productId: string;
  actorId: string;
}

export class ArchiveExamProductHandler {
  constructor(
    private readonly repository: ExamProductRepository,
    private readonly uow: IUnitOfWork
  ) {}

  public async execute(command: ArchiveExamProductCommand): Promise<Result<void, Error>> {
    try {
      await this.uow.begin();

      const product = await this.repository.findById(command.productId);
      if (!product) {
        throw new Error(`Exam product with ID ${command.productId} not found.`);
      }

      product.archive(command.actorId);
      await this.repository.save(product);

      this.uow.registerOutbox({
        eventType: 'ExamProductArchivedIntegrationEvent',
        aggregateType: 'ExamProduct',
        aggregateId: product.id,
        payload: {
          productId: product.id,
          archivedBy: command.actorId,
        },
      });

      await this.uow.commit();
      return Result.success(undefined);
    } catch (err: any) {
      await this.uow.rollback();
      return Result.failure(err);
    }
  }
}
