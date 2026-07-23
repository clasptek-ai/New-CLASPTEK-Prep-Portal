import { DatabasePool } from '../database-pool';
import { WrongAnswerQueue, WrongAnswerQueueRepository } from '@clasptek/domain-adaptive-practice';

export class PostgresWrongAnswerQueueRepository implements WrongAnswerQueueRepository {
  private inMemoryStore = new Map<string, WrongAnswerQueue>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(queue: WrongAnswerQueue): Promise<void> {
    this.inMemoryStore.set(queue.studentId, queue);
  }

  public async findByStudentId(studentId: string): Promise<WrongAnswerQueue | null> {
    return this.inMemoryStore.get(studentId) || null;
  }
}
