import { Entity } from '@clasptek/kernel';

export class AssessmentAttempt extends Entity<string> {
  constructor(
    id: string,
    public readonly sessionId: string,
    public readonly studentId: string,
    public readonly attemptNumber: number,
    public status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'EXPIRED' = 'IN_PROGRESS',
    public readonly startedAt: Date = new Date(),
    public submittedAt?: Date | undefined
  ) {
    super(id);
  }

  public completeAttempt(submittedAt: Date = new Date()): void {
    this.status = 'SUBMITTED';
    this.submittedAt = submittedAt;
  }

  public timeoutAttempt(timedOutAt: Date = new Date()): void {
    this.status = 'TIMED_OUT';
    this.submittedAt = timedOutAt;
  }
}
