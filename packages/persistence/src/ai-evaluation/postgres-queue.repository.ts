import { EvaluationQueue, EvaluationQueueRepositoryContract } from '@clasptek/domain-ai-evaluation';

export class PostgresQueueRepository implements EvaluationQueueRepositoryContract {
  private queue: EvaluationQueue | null = null;

  public async saveQueue(queue: EvaluationQueue): Promise<void> {
    this.queue = queue;
  }

  public async findQueue(): Promise<EvaluationQueue | null> {
    return this.queue;
  }
}
