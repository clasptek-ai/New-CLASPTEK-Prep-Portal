import { ExamProductRepository } from '@clasptek/domain-exam-product';
import { ExamProductPublishingService } from '@clasptek/domain-exam-product';
import { IUnitOfWork } from '../ports/IUnitOfWork';
import { Result } from '@clasptek/kernel';

export interface PublishExamProductCommand {
  productId: string;
  versionId: string;
  actorId: string;
}

export class PublishExamProductHandler {
  constructor(
    private readonly repository: ExamProductRepository,
    private readonly publishingService: ExamProductPublishingService,
    private readonly uow: IUnitOfWork
  ) {}

  public async execute(command: PublishExamProductCommand): Promise<Result<void, Error>> {
    try {
      await this.uow.begin();

      const product = await this.repository.findById(command.productId);
      if (!product) {
        throw new Error(`Exam product with ID ${command.productId} not found.`);
      }

      const publishResult = this.publishingService.publish(product, command.versionId, command.actorId);
      if (publishResult.isFailure) {
        throw publishResult.error;
      }

      await this.repository.save(product);

      // Register integration event to transactional outbox
      this.uow.registerOutbox({
        eventType: 'ExamProductPublishedIntegrationEvent',
        aggregateType: 'ExamProduct',
        aggregateId: product.id,
        payload: {
          productId: product.id,
          versionId: command.versionId,
          versionNo: product.currentVersionNo || '',
          name: product.name,
          code: product.code.value,
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
