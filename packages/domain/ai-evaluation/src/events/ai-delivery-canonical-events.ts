import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseEvaluationEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly eventVersion = 1;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {},
    occurredAt: Date = new Date()
  ) {
    this.occurredAt = occurredAt;
  }
}

export class EvaluationQueued extends BaseEvaluationEvent {
  constructor(jobId: string, studentId: string) {
    super('EvaluationQueued', jobId, { studentId });
  }
}

export class ProviderSelected extends BaseEvaluationEvent {
  constructor(jobId: string, provider: string) {
    super('ProviderSelected', jobId, { provider });
  }
}

export class ProviderFailed extends BaseEvaluationEvent {
  constructor(jobId: string, provider: string, errorMessage: string) {
    super('ProviderFailed', jobId, { provider, errorMessage });
  }
}

export class RetryStarted extends BaseEvaluationEvent {
  constructor(jobId: string, retryAttempt: number) {
    super('RetryStarted', jobId, { retryAttempt });
  }
}

export class RetryCompleted extends BaseEvaluationEvent {
  constructor(jobId: string, retryAttempt: number) {
    super('RetryCompleted', jobId, { retryAttempt });
  }
}

export class EvaluationCompleted extends BaseEvaluationEvent {
  constructor(jobId: string, studentId: string) {
    super('EvaluationCompleted', jobId, { studentId });
  }
}

export class EvaluationCancelled extends BaseEvaluationEvent {
  constructor(jobId: string, reason: string) {
    super('EvaluationCancelled', jobId, { reason });
  }
}

export class BudgetExceeded extends BaseEvaluationEvent {
  constructor(budgetId: string, type: 'DAILY' | 'MONTHLY', currentSpend: number) {
    super('BudgetExceeded', budgetId, { type, currentSpend });
  }
}

export class ProviderRecovered extends BaseEvaluationEvent {
  constructor(provider: string) {
    super('ProviderRecovered', provider, {});
  }
}

export class WorkerStarted extends BaseEvaluationEvent {
  constructor(workerId: string) {
    super('WorkerStarted', workerId, {});
  }
}

export class WorkerStopped extends BaseEvaluationEvent {
  constructor(workerId: string) {
    super('WorkerStopped', workerId, {});
  }
}
