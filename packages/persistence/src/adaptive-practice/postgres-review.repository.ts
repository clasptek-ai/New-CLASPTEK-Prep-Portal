import { DatabasePool } from '../database-pool';
import {
  PracticeReviewQueue,
  PracticeReviewQueueRepository,
} from '@clasptek/domain-adaptive-practice';

export class PostgresPracticeReviewQueueRepository implements PracticeReviewQueueRepository {
  private inMemoryStore = new Map<string, PracticeReviewQueue>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(queue: PracticeReviewQueue): Promise<void> {
    this.inMemoryStore.set(queue.sessionId, queue);
  }

  public async findBySessionId(sessionId: string): Promise<PracticeReviewQueue | null> {
    return this.inMemoryStore.get(sessionId) || null;
  }
}
