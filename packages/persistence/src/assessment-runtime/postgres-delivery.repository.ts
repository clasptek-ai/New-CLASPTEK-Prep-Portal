import { DatabasePool } from '../database-pool';
import {
  AssessmentResult,
  AssessmentResultRepository,
  AssessmentAttempt,
  AssessmentAttemptRepository,
  AssessmentTimerRepository,
  AssessmentTimerRecord,
} from '@clasptek/domain-assessment-runtime';

export class PostgresAssessmentResultRepository implements AssessmentResultRepository {
  private inMemoryStore = new Map<string, AssessmentResult>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(result: AssessmentResult): Promise<void> {
    this.inMemoryStore.set(result.id, result);
  }

  public async findBySessionId(sessionId: string): Promise<AssessmentResult | null> {
    for (const res of this.inMemoryStore.values()) {
      if (res.sessionId === sessionId) return res;
    }
    return null;
  }

  public async findByStudentId(studentId: string): Promise<AssessmentResult[]> {
    return Array.from(this.inMemoryStore.values()).filter((r) => r.studentId === studentId);
  }
}

export class PostgresAssessmentAttemptRepository implements AssessmentAttemptRepository {
  private inMemoryStore = new Map<string, AssessmentAttempt>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(attempt: AssessmentAttempt): Promise<void> {
    this.inMemoryStore.set(attempt.id, attempt);
  }

  public async findLatest(sessionId: string): Promise<AssessmentAttempt | null> {
    const matches = Array.from(this.inMemoryStore.values()).filter(
      (a) => a.sessionId === sessionId
    );
    if (matches.length === 0) return null;
    return matches.sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
  }

  public async findByStudent(studentId: string): Promise<AssessmentAttempt[]> {
    return Array.from(this.inMemoryStore.values()).filter((a) => a.studentId === studentId);
  }
}

export class PostgresAssessmentTimerRepository implements AssessmentTimerRepository {
  private inMemoryStore = new Map<string, AssessmentTimerRecord>();

  constructor(public readonly pool?: DatabasePool) {}

  public async save(timer: AssessmentTimerRecord): Promise<void> {
    this.inMemoryStore.set(timer.sessionId, timer);
  }

  public async findBySessionId(sessionId: string): Promise<AssessmentTimerRecord | null> {
    return this.inMemoryStore.get(sessionId) || null;
  }

  public async updateHeartbeat(
    sessionId: string,
    remainingSeconds: number,
    driftSeconds: number
  ): Promise<void> {
    const record = this.inMemoryStore.get(sessionId);
    if (record) {
      record.remainingSeconds = remainingSeconds;
      record.driftSeconds = driftSeconds;
      record.lastHeartbeatAt = new Date();
      this.inMemoryStore.set(sessionId, record);
    }
  }
}
