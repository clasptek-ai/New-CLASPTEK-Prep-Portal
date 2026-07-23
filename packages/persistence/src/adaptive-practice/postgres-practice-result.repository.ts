import { DatabasePool } from '../database-pool';
import { PracticeResult, PracticeResultRepository } from '@clasptek/domain-adaptive-practice';

export class PostgresPracticeResultRepository implements PracticeResultRepository {
  private inMemoryStore = new Map<string, PracticeResult>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(result: PracticeResult): Promise<void> {
    this.inMemoryStore.set(result.id, result);
  }

  public async findBySessionId(sessionId: string): Promise<PracticeResult | null> {
    for (const res of this.inMemoryStore.values()) {
      if (res.sessionId === sessionId) return res;
    }
    return null;
  }

  public async findByStudentId(studentId: string): Promise<PracticeResult[]> {
    return Array.from(this.inMemoryStore.values()).filter((r) => r.studentId === studentId);
  }
}
