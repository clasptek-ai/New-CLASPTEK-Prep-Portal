import { randomUUID } from 'crypto';

export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  eventName: string;
  occurredAt: Date;
  payload: Record<string, any>;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId = randomUUID();
  public readonly occurredAt = new Date();
  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {}
  ) {}
}

export class DiagnosticCreated extends BaseDomainEvent {
  constructor(catalogId: string, code: string) {
    super('DiagnosticCreated', catalogId, { code });
  }
}

export class AttemptStarted extends BaseDomainEvent {
  constructor(attemptId: string, studentId: string, catalogId: string) {
    super('AttemptStarted', attemptId, { studentId, catalogId });
  }
}

export class AttemptSubmitted extends BaseDomainEvent {
  constructor(attemptId: string, studentId: string, score: number) {
    super('AttemptSubmitted', attemptId, { studentId, score });
  }
}

export class AttemptAbandoned extends BaseDomainEvent {
  constructor(attemptId: string) {
    super('AttemptAbandoned', attemptId);
  }
}

export class AttemptCompleted extends BaseDomainEvent {
  constructor(attemptId: string, placementStage: string) {
    super('AttemptCompleted', attemptId, { placementStage });
  }
}

export class PlacementCalculated extends BaseDomainEvent {
  constructor(placementId: string, attemptId: string, stage: string, confidence: number) {
    super('PlacementCalculated', placementId, { attemptId, stage, confidence });
  }
}

export class SkillProfileGenerated extends BaseDomainEvent {
  constructor(profileId: string, studentId: string, skills: Record<string, number>) {
    super('SkillProfileGenerated', profileId, { studentId, skills });
  }
}

export class RecommendationsGenerated extends BaseDomainEvent {
  constructor(studentId: string, pathId: string) {
    super('RecommendationsGenerated', studentId, { pathId });
  }
}

export class ExposureRecorded extends BaseDomainEvent {
  constructor(ledgerId: string, studentId: string, questionId: string) {
    super('ExposureRecorded', ledgerId, { studentId, questionId });
  }
}

export class SelectionAudited extends BaseDomainEvent {
  constructor(auditId: string, attemptId: string, questionId: string) {
    super('SelectionAudited', auditId, { attemptId, questionId });
  }
}
