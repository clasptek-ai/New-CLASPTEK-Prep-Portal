import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  eventVersion: number;
  aggregateId: string;
  occurredAt: Date;
  eventName: string;
  payload: Record<string, any>;
}

export abstract class BaseResultsEvent implements DomainEvent {
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

export class ResultPublished extends BaseResultsEvent {
  constructor(resultId: string, studentId: string, resultType: string, occurredAt?: Date) {
    super('ResultPublished', resultId, { studentId, resultType }, occurredAt);
  }
}

export class ProgressUpdated extends BaseResultsEvent {
  constructor(studentId: string, overallScore: number, status: string, occurredAt?: Date) {
    super('ProgressUpdated', studentId, { overallScore, status }, occurredAt);
  }
}

export class ReportGenerated extends BaseResultsEvent {
  constructor(reportId: string, studentId: string, reportType: string, occurredAt?: Date) {
    super('ReportGenerated', reportId, { studentId, reportType }, occurredAt);
  }
}

export class AcademicSummaryUpdated extends BaseResultsEvent {
  constructor(studentId: string, totalAssessments: number, occurredAt?: Date) {
    super('AcademicSummaryUpdated', studentId, { totalAssessments }, occurredAt);
  }
}
