import type { MockSession, MockResult } from '../index';
import { MockCheckpoint } from '../aggregates/mock-checkpoint.aggregate';
import { SubjectiveEvaluationQueue } from '../aggregates/subjective-evaluation-queue.aggregate';

export interface MockSessionRepositoryContract {
  save(session: MockSession): Promise<void>;
  findById(id: string): Promise<MockSession | null>;
  findByStudentId(studentId: string): Promise<MockSession[]>;
}

export interface MockResultRepositoryContract {
  save(result: MockResult): Promise<void>;
  findBySessionId(sessionId: string): Promise<MockResult | null>;
  findByStudentId(studentId: string): Promise<MockResult[]>;
}

export interface CheckpointRepositoryContract {
  save(checkpoint: MockCheckpoint): Promise<void>;
  findLatestBySessionId(sessionId: string): Promise<MockCheckpoint | null>;
}

export interface IntegrityRepositoryContract {
  logViolation(sessionId: string, type: string, details: string): Promise<void>;
  getWarningCount(sessionId: string): Promise<number>;
}

export interface EvaluationRepositoryContract {
  saveQueue(queue: SubjectiveEvaluationQueue): Promise<void>;
  findQueueBySessionId(sessionId: string): Promise<SubjectiveEvaluationQueue | null>;
}
