import { AggregateRoot, Entity } from '@clasptek/kernel';
import { AttemptStarted, AttemptSubmitted, AttemptAbandoned } from '../events/DiagnosticEvents';

export class Response extends Entity<string> {
  constructor(
    id: string,
    public readonly attemptId: string,
    public readonly questionId: string,
    public readonly questionVersionId: string,
    public responsePayload: Record<string, any>,
    public isCorrect: boolean = false,
    public timeSpentMs: number = 0,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    super(id);
  }

  public update(payload: Record<string, any>, isCorrect: boolean, timeSpentMs: number): void {
    this.responsePayload = payload;
    this.isCorrect = isCorrect;
    this.timeSpentMs = timeSpentMs;
    this.updatedAt = new Date();
  }
}

export class DiagnosticAttempt extends AggregateRoot<string> {
  private _responses: Response[] = [];

  constructor(
    id: string,
    public readonly studentId: string,
    public readonly catalogId: string,
    public status: 'STARTED' | 'SUBMITTED' | 'COMPLETED' | 'ABANDONED' = 'STARTED',
    public readonly startedAt: Date = new Date(),
    public closedAt: Date | null = null,
    public score: number | null = null,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {
    super(id);
  }

  public get responses(): readonly Response[] {
    return this._responses;
  }

  public static start(
    id: string,
    studentId: string,
    catalogId: string,
    tenantId: string
  ): DiagnosticAttempt {
    const attempt = new DiagnosticAttempt(
      id,
      studentId,
      catalogId,
      'STARTED',
      new Date(),
      null,
      null,
      tenantId
    );
    attempt.addDomainEvent(new AttemptStarted(id, studentId, catalogId));
    return attempt;
  }

  public submitResponse(
    id: string,
    questionId: string,
    questionVersionId: string,
    payload: Record<string, any>,
    isCorrect: boolean,
    timeSpentMs: number
  ): Response {
    if (this.status !== 'STARTED') {
      throw new Error('Cannot submit response for an attempt that is not active');
    }
    const existing = this._responses.find((r) => r.questionVersionId === questionVersionId);
    if (existing) {
      existing.update(payload, isCorrect, timeSpentMs);
      this.updatedAt = new Date();
      return existing;
    }
    const res = new Response(
      id,
      this.id,
      questionId,
      questionVersionId,
      payload,
      isCorrect,
      timeSpentMs,
      this.tenantId
    );
    this._responses.push(res);
    this.updatedAt = new Date();
    return res;
  }

  public submit(score: number): void {
    if (this.status !== 'STARTED') {
      throw new Error('Attempt is already closed or submitted');
    }
    this.status = 'SUBMITTED';
    this.closedAt = new Date();
    this.score = score;
    this.updatedAt = new Date();
    this.addDomainEvent(new AttemptSubmitted(this.id, this.studentId, score));
  }

  public abandon(): void {
    if (this.status !== 'STARTED') {
      throw new Error('Attempt is already closed or submitted');
    }
    this.status = 'ABANDONED';
    this.closedAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new AttemptAbandoned(this.id));
  }

  public loadResponses(responses: Response[]): void {
    this._responses = responses;
  }
}
