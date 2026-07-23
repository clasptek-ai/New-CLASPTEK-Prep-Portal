import { AssessmentResult } from '../aggregates/assessment-result.aggregate';
import { AssessmentAttempt } from '../entities/assessment-attempt.entity';

export interface AssessmentResultRepository {
  save(result: AssessmentResult): Promise<void>;
  findBySessionId(sessionId: string): Promise<AssessmentResult | null>;
  findByStudentId(studentId: string): Promise<AssessmentResult[]>;
}

export interface AssessmentAttemptRepository {
  save(attempt: AssessmentAttempt): Promise<void>;
  findLatest(sessionId: string): Promise<AssessmentAttempt | null>;
  findByStudent(studentId: string): Promise<AssessmentAttempt[]>;
}

export interface AssessmentTimerRecord {
  sessionId: string;
  allocatedSeconds: number;
  remainingSeconds: number;
  state: string;
  lastHeartbeatAt: Date;
  driftSeconds: number;
}

export interface AssessmentTimerRepository {
  save(timer: AssessmentTimerRecord): Promise<void>;
  findBySessionId(sessionId: string): Promise<AssessmentTimerRecord | null>;
  updateHeartbeat(sessionId: string, remainingSeconds: number, driftSeconds: number): Promise<void>;
}
