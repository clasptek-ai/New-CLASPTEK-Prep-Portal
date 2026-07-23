import { DatabasePool } from '../database-pool';
import { PracticeAttempt, PracticeAttemptRepository } from '@clasptek/domain-adaptive-practice';

export class PostgresPracticeAttemptRepository implements PracticeAttemptRepository {
  private inMemoryStore = new Map<string, PracticeAttempt>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(attempt: PracticeAttempt): Promise<void> {
    this.inMemoryStore.set(attempt.id, attempt);
  }

  public async findLatest(sessionId: string): Promise<PracticeAttempt | null> {
    const matches = Array.from(this.inMemoryStore.values()).filter(
      (a) => a.sessionId === sessionId
    );
    if (matches.length === 0) return null;
    return matches.sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
  }

  public async findByStudentId(studentId: string): Promise<PracticeAttempt[]> {
    return Array.from(this.inMemoryStore.values()).filter((a) => a.studentId === studentId);
  }
}
