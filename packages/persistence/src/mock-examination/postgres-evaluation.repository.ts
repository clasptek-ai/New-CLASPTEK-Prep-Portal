import {
  SubjectiveEvaluationQueue,
  EvaluationRepositoryContract,
} from '@clasptek/domain-mock-examination';

export class PostgresEvaluationRepository implements EvaluationRepositoryContract {
  private queues = new Map<string, SubjectiveEvaluationQueue>();

  public async saveQueue(queue: SubjectiveEvaluationQueue): Promise<void> {
    this.queues.set(queue.id, queue);
  }

  public async findQueueBySessionId(sessionId: string): Promise<SubjectiveEvaluationQueue | null> {
    const key = `seq-${sessionId}`;
    return this.queues.get(key) || null;
  }
}
