export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  payload: Record<string, any>;
  occurredOn: Date;
}

export abstract class BaseAssessmentEvent implements DomainEvent {
  public readonly occurredOn: Date;
  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any>,
    occurredAt?: Date
  ) {
    this.occurredOn = occurredAt ?? new Date();
  }
}

export class AssessmentTimedOut extends BaseAssessmentEvent {
  constructor(sessionId: string, occurredAt?: Date) {
    super('AssessmentTimedOut', sessionId, {}, occurredAt);
  }
}

export class AssessmentExpired extends BaseAssessmentEvent {
  constructor(sessionId: string, occurredAt?: Date) {
    super('AssessmentExpired', sessionId, {}, occurredAt);
  }
}

export class PracticeUnlocked extends BaseAssessmentEvent {
  constructor(studentId: string, recommendedSkillIds: string[]) {
    super('PracticeUnlocked', studentId, { recommendedSkillIds });
  }
}

export class ResultGenerated extends BaseAssessmentEvent {
  constructor(resultId: string, sessionId: string, overallScore: number, isPassed: boolean) {
    super('ResultGenerated', resultId, { sessionId, overallScore, isPassed });
  }
}

export class AssessmentAutoSubmitted extends BaseAssessmentEvent {
  constructor(sessionId: string, reason: string) {
    super('AssessmentAutoSubmitted', sessionId, { reason });
  }
}

export class AssessmentRecovered extends BaseAssessmentEvent {
  constructor(sessionId: string, checkpointVersion: number) {
    super('AssessmentRecovered', sessionId, { checkpointVersion });
  }
}

export class AssessmentCheckpointSaved extends BaseAssessmentEvent {
  constructor(sessionId: string, checkpointVersion: number) {
    super('AssessmentCheckpointSaved', sessionId, { checkpointVersion });
  }
}

export class ResultVisibilityChanged extends BaseAssessmentEvent {
  constructor(resultId: string, newVisibilityMode: string) {
    super('ResultVisibilityChanged', resultId, { newVisibilityMode });
  }
}
