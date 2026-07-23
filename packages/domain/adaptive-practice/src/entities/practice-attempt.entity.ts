import { Entity } from '@clasptek/kernel';

export class PracticeAttempt extends Entity<string> {
  constructor(
    id: string,
    public readonly sessionId: string,
    public readonly studentId: string,
    public readonly attemptNumber: number,
    public status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' = 'IN_PROGRESS',
    public readonly startedAt: Date = new Date(),
    public completedAt?: Date
  ) {
    super(id);
  }

  public completeAttempt(completedAt: Date = new Date()): void {
    this.status = 'SUBMITTED';
    this.completedAt = completedAt;
  }
}
