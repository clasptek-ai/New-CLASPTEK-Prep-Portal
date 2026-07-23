import { ExamProductRepository } from '@clasptek/domain-exam-product';
import { ExamProductFactory } from '@clasptek/domain-exam-product';
import { IUnitOfWork } from '../ports/IUnitOfWork';
import { Result } from '@clasptek/kernel';

export interface CreateExamProductCommand {
  code: string;
  name: string;
  description: string;
  productFamily: string;
}

export class CreateExamProductHandler {
  constructor(
    private readonly repository: ExamProductRepository,
    private readonly uow: IUnitOfWork
  ) {}

  public async execute(command: CreateExamProductCommand): Promise<Result<string, Error>> {
    try {
      await this.uow.begin();

      const exists = await this.repository.exists(command.code);
      if (exists) {
        throw new Error(`Exam product with code ${command.code} already exists.`);
      }

      const product = ExamProductFactory.create(
        command.code,
        command.name,
        command.description,
        command.productFamily
      );

      await this.repository.save(product);

      // Register integration event to transactional outbox
      this.uow.registerOutbox({
        eventType: 'ExamProductCreatedIntegrationEvent',
        aggregateType: 'ExamProduct',
        aggregateId: product.id,
        payload: {
          productId: product.id,
          code: product.code.value,
          name: product.name,
          productFamily: product.productFamily,
        },
      });

      await this.uow.commit();
      return Result.success(product.id);
    } catch (err: any) {
      await this.uow.rollback();
      return Result.failure(err);
    }
  }
}
